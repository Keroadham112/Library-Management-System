import { RouterProvider } from 'react-router-dom'
import { ConfirmDialogProvider } from './components/ui/ConfirmDialogProvider'
import { AuthProvider } from './context/AuthContext'
import { StorefrontCartProvider } from './context/StorefrontCartContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/ToastProvider'
import { router } from './routes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <StorefrontCartProvider>
              <RouterProvider router={router} />
            </StorefrontCartProvider>
          </ConfirmDialogProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
