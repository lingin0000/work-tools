import { createRootRoute, createRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Graphql from '../pages/graphql'
import JsonTool from '../pages/json'
import Layout from '../layout'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout />
      <TanStackRouterDevtools position="top-right" />
    </>
  )
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>index</div>
})

const graphqlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/graphql',
  component: Graphql
})

const JsonToolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/json',
  component: JsonTool
})

const routeTree = rootRoute.addChildren([indexRoute, graphqlRoute, JsonToolRoute])

export { routeTree }
