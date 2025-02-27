
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Payments from "./pages/Payments";
import Caja from "./pages/Caja";
import Investors from "./pages/Investors";
import InvestorSettlement from "./pages/Investors/components/InvestorSettlement";
import InvestorPayments from "./pages/InvestorPayments";
import Calendar from "./pages/Calendar";
import Drivers from "./pages/Drivers";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import "./App.css";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="payments" element={<Payments />} />
            <Route path="caja" element={<Caja />} />
            <Route path="investors" element={<Investors />} />
            <Route path="investors/:id/settlement" element={<InvestorSettlement />} />
            <Route path="investor-payments" element={<InvestorPayments />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
