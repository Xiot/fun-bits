// @flow

import type { Serializer } from '../contexts/url-state/types';
import type {
  PipelineReducer,
  PipelineSideEffect,
  BasePipelineApi,
} from '../services/pipeline/index';
import type { ApolloPipelineApi } from '../services/pipeline/apollo';

export type RouteArgs = { [string]: mixed };
export type { Serializer };

export type SerializerMap = {
  // flowlint-next-line unclear-type:off
  [string]: Serializer<any>,
};

/**
 * New Routing API.
 */
export interface IRouterContext {
  /**
   * Accessor for the routes
   */
  +routes: RouteNodeBucket;

  /**
   * Determines if the the named route is currently selected.
   * @param name the name of the route to check
   * @returns true if the current route, or its parents, match the name
   */
  isCurrentRoute(name: string, opts?: { exact: boolean }): boolean;

  /**
   * Navigate to the uri
   */
  navigate(uri: string): void;

  /**
   * Navigate to the route named `name` and provide args.
   * @param {string} name the name of the route to navigate to
   * @param {RouteArgs} args the list of arguments. Arguments that are missing will be pulled from the current route.
   */
  go(name: string, args?: RouteArgs): void;

  /**
   * Gets a RouteNode by name
   * @param name the name of the route to find.
   * @returns the route.
   */
  get(name: string): ?RouteNode;

  /**
   * Resolves the `name` and `args` to a uri.
   * @param {string} name the name of the route.
   * @param {RouteArgs} args the list of arguments. Arguments that are missing will be pulled from the current route.
   * @returns the resolved uri
   */
  resolve(name: string, args: RouteArgs): string;

  /**
   * The current `RouteInstance`
   * @returns the RouteInstance representing the current route.
   */
  current(): RouteInstance;

  /**
   * Find the RouteDefinition based on a uri
   * @param {string} path the uri
   * @returns the RouteDefinition of the matched route, or `null` if not found.
   */
  find(path: string): ?RouteDefinition;

  /**
   * Find the RouteNode based on a uri
   * @param {path} path the uri
   * @returns the RouteNode of the matched route, or `null` if not found.
   */
  findNode(path: string): ?RouteNode;

  /**
   * Returns the current parameters
   */
  params<T>(): T;

  /**
   * Sets the parameters on the current route
   * @param args the values to set
   */
  params<T>(args: $Shape<T>): void;

  /**
   * Sets the parameters based on the current values
   * @param factory the function to produce the new values.
   */
  params<T>(factory: (T) => $Shape<T>): void;
}

export type RoutePipelineApi = ApolloPipelineApi;

export interface RouteNodeBucket {
  get(name: string): ?RouteNode;
  all(): $ReadOnlyArray<RouteNode>;
  definitions(): $ReadOnlyArray<RouteDefinition>;
}

export interface RouteInstance {
  name: string;
  route: RouteDefinition;
  node: RouteNode;
  params: { [string]: ?mixed };
  uri: string;
  exact: boolean;
}

export type RoutePipelineTrigger<TApi: BasePipelineApi> = {
  reducers: PipelineReducer<TApi>[],
  effects: PipelineSideEffect<TApi>[],
};
export type ComponentRoute = {
  type: 'view',
  name: string,
  exact?: boolean,
  path: string,
  component: React$ComponentType<mixed>,
  children?: RouteDefinition[],
  params: SerializerMap,

  onEnter?: $Shape<RoutePipelineTrigger<RoutePipelineApi>>,
  onExit?: $Shape<RoutePipelineTrigger<RoutePipelineApi>>,
};

export type RedirectRoute = {
  type: 'redirect',
  name: string,
  exact?: boolean,
  path: string,
  to: string,
};

export type DefaultRoute = {
  type: 'default',
  name: string,
  exact?: boolean,
  component: React$ComponentType<mixed>,
};

export type RouteDefinition = ComponentRoute | RedirectRoute | DefaultRoute;
export type RouteNode = {
  path: string,
  serializers: SerializerMap,

  route: RouteDefinition,
  parents: RouteNode[],
  children: RouteNode[],

  onEnter: RoutePipelineTrigger<RoutePipelineApi>,
  onExit: RoutePipelineTrigger<RoutePipelineApi>,
};
