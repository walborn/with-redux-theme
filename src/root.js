import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import Home from './pages/Home'
import NoMatch from './pages/NoMatch'

const Root = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
)

export default Root
