import { createRootRoute, createRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Graphql from '@renderer/pages/graphql'
import JsonTool from '@renderer/pages/json'
import App from '@renderer/App'

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
