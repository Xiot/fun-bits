import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SharedStateContext } from "../shared-state";
import { createRoutes } from "./index-routes";
import { createOutputPipeline } from "./pipeline";
import { IRouterContext, RouteArgs, RouteDefinition } from "./types";

const RouterContext = createContext<IRouterContext>({});

type RouterContextProviderProps = {
  children: React.ReactNode;

  routes: RouteDefinition[];

}
export const RouterContextProvider = (props: RouterContextProviderProps) => {

  const navigate = useNavigate()
  const state = useContext(SharedStateContext);

  const api = useMemo(() => {

    const bucket = createRoutes(props.routes);

    return {
      get routes() { return bucket; },
      isCurrentRoute(name: string, opts?: {exact: boolean}) {
        return false;
      },
      get(name: string) {
        return bucket.get(name)
      },
      resolve(name: string, args: RouteArgs ) {
        const node = bucket.get(name);
        if (node == null) throw new Error(`Route '${name}' not found`)
        // cant run pipeline cause of effects.
        
        // const uri = createOutputPipeline({state}, node)(args);        
        return '';
      }
    }
  }, [])

  return <RouterContext.Provider value={api}>{props.children}</RouterContext.Provider>
}