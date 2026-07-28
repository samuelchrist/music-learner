import React       from 'react'
import ReactDOM    from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App         from './App'
import './styles/globals.css'

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60000, refetchOnWindowFocus: false }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color:      '#e2e8f0',
            border:     '1px solid #2d2d4e',
          }
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)
