// @flow

import type { ParamSerializers, Serializer } from '../serializers';
import type { PipelineReducer, PipelineSideEffect, BasePipelineApi } from '../pipeline';

export type RouteArgs = { [name: string]: unknown };
export type { Serializer };

export type SerializerMap = {
  [name: string]: Serializer<any>;
};

/**
 * New Routing API.
 */
export interface IRouterContext {
  /**
   * Accessor for the routes
   */
  readonly routes: RouteNodeBucket;

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
  get(name: string): RouteNode | undefined;

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
  find(path: string): RouteDefinition | undefined;

  /**
   * Find the RouteNode based on a uri
   * @param {path} path the uri
   * @returns the RouteNode of the matched route, or `null` if not found.
   */
  findNode(path: string): RouteNode | undefined;

  /**
   * Returns the current parameters
   */
  params<T>(): T;

  /**
   * Sets the parameters on the current route
   * @param args the values to set
   */
  params<T>(args: Partial<T>): void;

  /**
   * Sets the parameters based on the current values
   * @param factory the function to produce the new values.
   */
  params<T>(factory: (value: T) => Partial<T>): void;
}

export type RoutePipelineApi = BasePipelineApi;

export interface RouteNodeBucket {
  get(name: string): RouteNode | undefined;
  all(): ReadonlyArray<RouteNode>;
  definitions(): ReadonlyArray<RouteDefinition>;
}

export interface RouteInstance {
  name: string;
  route: RouteDefinition;
  node: RouteNode;
  params: Record<string, unknown>;
  uri: string;
  exact: boolean;
}

export type RoutePipelineTrigger<TApi extends BasePipelineApi> = {
  reducers: PipelineReducer<TApi>[];
  effects: PipelineSideEffect<TApi>[];
};
export type ComponentRoute = {
  type: 'view';
  name: string;
  exact?: boolean;
  path: string;
  component: React.ComponentType<unknown>;
  children?: RouteDefinition[];
  params: SerializerMap;

  onEnter?: Partial<RoutePipelineTrigger<RoutePipelineApi>>;
  onExit?: Partial<RoutePipelineTrigger<RoutePipelineApi>>;
};

export type RedirectRoute = {
  type: 'redirect';
  name: string;
  exact?: boolean;
  path: string;
  to: string;
};

export type DefaultRoute = {
  type: 'default';
  name: string;
  exact?: boolean;
  component: React.ComponentType<unknown>;
};

export type RouteDefinition = ComponentRoute | RedirectRoute | DefaultRoute;
export type RouteNode<TParams = any> = {
  path: string;
  serializers: ParamSerializers<TParams>;

  route: RouteDefinition;
  parents: RouteNode[];
  children: RouteNode[];

  onEnter: RoutePipelineTrigger<RoutePipelineApi>;
  onExit: RoutePipelineTrigger<RoutePipelineApi>;
};
