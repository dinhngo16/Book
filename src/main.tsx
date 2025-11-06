import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from '@/layout';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import BookPage from './pages/client/book';
import AboutPage from './pages/client/about';
import LoginPage from './pages/client/auth/loginpage';
import RegisterPage from 'pages/client/auth/register';
import 'styles/global.scss'
import HomePage from './pages/client/homepage';
import { App } from 'antd';
import { AppProvider } from './component/context/app.context';
import ProtectedRoute from './component/auth/auth';
import DashBoardPage from 'pages/admin/dashboard';
import ManageBookPage from '@/pages/admin/manageBook/manage.book';
import ManageOrderPage from 'pages/admin/manage.order';
import ManageUserPage from 'pages/admin/manage.user';
import LayoutAdmin from './component/layout/layout.admin';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import OrderPage from './pages/client/orderpage';
import History from './pages/client/history';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/book/:id",
        element: <BookPage />
      },
      {
        path: "/book",
        element: <BookPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/order",
        element: <OrderPage />,
      },
      {
        path:"/history",
        element: <History />,
      },
      {
        path: "/checkout",
        element: (
          <ProtectedRoute>
            <div>checkout page</div>
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: "admin",
    element: <LayoutAdmin />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashBoardPage />
          </ProtectedRoute>
        )
      },
      {
        path: "book",
        element: (
          <ProtectedRoute>
            <ManageBookPage />
          </ProtectedRoute>
        )
      },
      {
        path: "order",
        element: (
          <ProtectedRoute>
            <ManageOrderPage />
          </ProtectedRoute>
        )
      },
      {
        path: "user",
        element: (
          <ProtectedRoute>
            <ManageUserPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute>
            <div>admin page</div>
          </ProtectedRoute>
        ),
      },

    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppProvider>
        <ConfigProvider locale={enUS}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </AppProvider>
    </App>
  </StrictMode>,
)
