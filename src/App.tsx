
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import VehiclesPage from "@/pages/Vehicles";
import DriversPage from "@/pages/Drivers";
import Investors from "@/pages/Investors";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import Dashboard from "@/pages/Dashboard";
import PaymentAnalysis from "@/pages/PaymentAnalysis";
import "./App.css";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="investors" element={<Investors />} />
        <Route path="payments" element={<Payments />} />
        <Route path="payment-analysis" element={<PaymentAnalysis />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
