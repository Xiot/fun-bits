// @flow
import {
  createPipeline,
  pipe,
  executeSideEffects,
  storeValue,
  applyDecoders,
  applyEncoders,
  type BasePipelineApi,
  type PipelineReducer,
} from '../pipeline';
import { createStateKey } from '../shared-state';
import type { RouteNode, RoutePipelineApi } from './types';
import UriParse from 'url-parse';
import { matchPath, generatePath } from 'react-router-dom';
import qs from 'qs';
import { groupParams } from './utils';
import { trimEnd } from '../utils/string';

const RawUrlParamsKey = createStateKey('url-params-raw', {});
const ProcessedUrlParamsKey = createStateKey('url-params-processed', {});

const parseUri =
  <TApi extends BasePipelineApi>(node: RouteNode): PipelineReducer<TApi, Record<string, string>, string> =>
  (uri, previousUri, api) => {
    const parsed = new UriParse(uri);
    const match = matchPath(parsed.pathname, node.path);
    const params = {
      ...(match?.params ?? {}),
      ...qs.parse(parsed.query, { ignoreQueryPrefix: true }),
    } as Record<string, string>;
    return params;
  };

const serializeUri =
  <TApi extends BasePipelineApi, TValue extends Record<string, string>>(
    node: RouteNode,
  ): PipelineReducer<TApi, string, TValue> =>
  (value, prevValue, api) => {
    const template = trimEnd(node.path, '/');
    const grouped = groupParams(value, template);
    return (
      generatePath(template, grouped.path) +
      qs.stringify(grouped.query, { addQueryPrefix: true, encode: false, skipNulls: true })
    );
  };

export const createInputPipeline = <T>(api: RoutePipelineApi, node: RouteNode<T>): ((uri: string) => T) => {
  return createPipeline<RoutePipelineApi, string, T>(
    api,
    pipe(
      parseUri(node),
      pipe(
        // Save the original url params
        executeSideEffects(storeValue(RawUrlParamsKey)),
        // Apply Decoders
        applyDecoders(node.serializers),
        // Apply Customizable Reducers
        pipe(...node.onEnter.reducers),
        // Save Processed
        executeSideEffects(storeValue(ProcessedUrlParamsKey)),
        // Side Effects
        executeSideEffects(...node.onEnter.effects),
      ),
    ),
  );
};

export const createOutputPipeline = <TValue extends Record<string, unknown>>(
  api: RoutePipelineApi,
  node: RouteNode,
): ((value: TValue) => string) => {
  return createPipeline<RoutePipelineApi, TValue, string>(
    api,
    pipe(
      // Merge with Existing
      (value, _, { state }) => ({ ...state.get(ProcessedUrlParamsKey), ...value }),

      // ApplyEncoders
      applyEncoders(node.serializers),
      // User Defined reducers
      pipe(...node.onExit.reducers),
      executeSideEffects(...node.onExit.effects),

      serializeUri(node),
    ),
  );
};
