import { Navigate, createBrowserRouter } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth'
import MainLayout from '../layouts/MainLayout'
import Login from '../pages/Login'
import Categories from '../pages/Categories'
import CustomerStore from '../pages/CustomerStore'
import Customers from '../pages/Customers'
import Dashboard from '../pages/Dashboard'
import Products from '../pages/Products'
import Purchases from '../pages/Purchases'
import Sales from '../pages/Sales'
import Suppliers from '../pages/Suppliers'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'suppliers',
        element: <Suppliers />,
      },
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'customer-store',
        element: <CustomerStore />,
      },
      {
        path: 'purchases',
        element: <Purchases />,
      },
      {
        path: 'sales',
        element: <Sales />,
      },
    ],
  },
])
