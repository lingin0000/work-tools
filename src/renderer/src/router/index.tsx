import { createRootRoute, createRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Graphql from '../pages/graphql'
import JsonTool from '../pages/json'
import App from '../App'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <App />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/graphql',
  component: Graphql
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/json',
  component: JsonTool
})
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])

export { routeTree }
