import { RouterProvider } from 'react-router-dom'
import { ConfirmDialogProvider } from './components/ui/ConfirmDialogProvider'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/ToastProvider'
import { router } from './routes'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <RouterProvider router={router} />
        </ConfirmDialogProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
