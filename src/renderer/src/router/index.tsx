import { createRootRoute, createRoute } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Graphql from '@renderer/pages/graphql'
import App from '@renderer/App'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <App />
      {/* <TanStackRouterDevtools /> */}
    </>
  )
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/graphql',
  component: () => <Graphql />
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: function About() {
    return <div className="p-2">Hello from About!</div>
  }
})
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])

export { routeTree }
