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
import StorefrontCart from '../pages/storefront/StorefrontCart'
import StorefrontHome from '../pages/storefront/StorefrontHome'
import StorefrontProductDetails from '../pages/storefront/StorefrontProductDetails'
import StorefrontProducts from '../pages/storefront/StorefrontProducts'
import StorefrontLayout from '../layouts/StorefrontLayout'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/store',
    element: <StorefrontLayout />,
    children: [
      {
        index: true,
        element: <StorefrontHome />,
      },
      {
        path: 'products',
        element: <StorefrontProducts />,
      },
      {
        path: 'products/:id',
        element: <StorefrontProductDetails />,
      },
      {
        path: 'cart',
        element: <StorefrontCart />,
      },
    ],
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
