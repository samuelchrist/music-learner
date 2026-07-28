import { Outlet } from 'react-router-dom'
import Navbar     from '../Navbar'
export default function PageWrapper() {
  return <div className="min-h-screen flex flex-col bg-bg"><Navbar/><main className="flex-1"><Outlet/></main></div>
}
