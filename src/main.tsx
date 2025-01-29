
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient,QueryClientProvider } from 'react-query'
import {AuthProvider} from './context/authContext.tsx'

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <App />
            </AuthProvider>
    </QueryClientProvider>
)
