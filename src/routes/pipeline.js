// @flow
import {
  createPipeline,
  compose,
  executeSideEffects,
  storeValue,
  applyDecoders,
  applyEncoders,
  type BasePipelineApi,
  type PipelineReducer,
} from '../services/pipeline/index';
import { createStateKey } from '../contexts/shared-state';
import type { RouteNode, RoutePipelineApi } from './types';
import UriParse from 'url-parse';
import { matchPath, generatePath } from 'react-router-dom';
import qs from 'qs';
import { groupParams } from './utils';
import { trimEnd } from '../utils/string';

const RawUrlParamsKey = createStateKey('url-params-raw', {});
const ProcessedUrlParamsKey = createStateKey('url-params-processed', {});

const parseUri =
  <T: BasePipelineApi>(node: RouteNode): PipelineReducer<T> =>
  (uri, previousUri, api) => {
    const parsed = new UriParse(uri);
    const match = matchPath(parsed.pathname, node.path);
    const params = {
      ...match.params,
      ...qs.parse(parsed.query, { ignoreQueryPrefix: true }),
    };
    return params;
  };

const serializeUri =
  <T: BasePipelineApi>(node: RouteNode): PipelineReducer<T> =>
  (value, prevValue, api) => {
    const template = trimEnd(node.path, '/');
    const grouped = groupParams(value, template);
    return (
      generatePath(template, grouped.path) +
      qs.stringify(grouped.query, { addQueryPrefix: true, encode: false, skipNulls: true })
    );
  };

export const createInputPipeline = <T>(
  api: RoutePipelineApi,
  node: RouteNode
): ((uri: string) => T) => {
  return createPipeline<RoutePipelineApi>(
    api,
    compose(
      parseUri(node),
      compose(
        // Save the original url params
        executeSideEffects(storeValue(RawUrlParamsKey)),
        // Apply Decoders
        applyDecoders(node.serializers),
        // Apply Customizable Reducers
        compose(...node.onEnter.reducers),
        // Save Processed
        executeSideEffects(storeValue(ProcessedUrlParamsKey)),
        // Side Effects
        executeSideEffects(...node.onEnter.effects)
      )
    )
  );
};

const mergeWithCurrent = (value, prevValue, { state }) => ({
  ...state.get(ProcessedUrlParamsKey),
  ...value,
});

export const createOutputPipeline = (
  api: RoutePipelineApi,
  node: RouteNode
): ((value: mixed) => string) => {
  return createPipeline(
    api,
    compose(
      // Merge with Existing
      mergeWithCurrent,
      // ApplyEncoders
      applyEncoders(node.serializers),
      // User Defined reducers
      compose(...node.onExit.reducers),
      compose(executeSideEffects(...node.onExit.effects)),

      serializeUri(node)
    )
  );
};
