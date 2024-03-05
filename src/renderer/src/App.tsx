import RootLayout from './layout'
import { Outlet } from '@tanstack/react-router'

function App(): JSX.Element {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  )
}

export default App
