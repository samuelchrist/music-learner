import { RouterProvider } from 'react-router-dom'
import { router }         from './router'
import SoundLoader        from '@/components/ui/SoundLoader'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <SoundLoader />
    </>
  )
}
