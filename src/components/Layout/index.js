import { Outlet } from 'react-router-dom'

import Theme from '../Theme'

const Layout = () => (
  <>
    <Theme />
    <main>
      <Outlet />
    </main>
  </>
)

export default Layout
