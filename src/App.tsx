
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";

// Lazy-loaded components para mejorar el rendimiento inicial
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const Payments = lazy(() => import("@/pages/Payments"));
const PaymentAnalysis = lazy(() => import("@/pages/PaymentAnalysis"));
const Investors = lazy(() => import("@/pages/Investors"));
const InvestorSettlement = lazy(() => import("@/pages/Investors/components/InvestorSettlement"));
const Drivers = lazy(() => import("@/pages/Drivers"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Index = lazy(() => import("@/pages/Index"));

// Componente de carga para Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  // Establecer el título de la aplicación
  useEffect(() => {
    document.title = "Sistema de Gestión de Flota";
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="payments" element={<Payments />} />
              <Route path="payment-analysis" element={<PaymentAnalysis />} />
              <Route path="investors" element={<Investors />} />
              <Route path="investors/:id/settlement" element={<InvestorSettlement />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="not-found" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </AppProvider>
  );
}

export default App;
