
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Vehicles from "@/pages/Vehicles";
import Payments from "@/pages/Payments";
import PaymentAnalysis from "@/pages/PaymentAnalysis";
import Calendar from "@/pages/Calendar";
import Investors from "@/pages/Investors";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import "./App.css";

// Importamos la página de Drivers
import Drivers from "@/pages/Drivers";

function App() {
  // Establecer el título de la aplicación
  useEffect(() => {
    document.title = "Sistema de Gestión de Flota";
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="payments" element={<Payments />} />
            <Route path="payment-analysis" element={<PaymentAnalysis />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="investors" element={<Investors />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AppProvider>
  );
}

export default App;
