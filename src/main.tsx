
import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App'
import './index.css'
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Use createHashRouter instead of createBrowserRouter for GitHub Pages
const router = createHashRouter([
  {
    path: "*",
    element: <App />,
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
