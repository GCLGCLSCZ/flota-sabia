
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import VehiclesPage from "./pages/Vehicles";
import DriversPage from "./pages/Drivers";
import InvestorsPage from "./pages/Investors";
import PaymentsPage from "./pages/Payments";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import InvestorSettlement from "./pages/Investors/components/InvestorSettlement";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="vehicles" element={<VehiclesPage />} />
                <Route path="drivers" element={<DriversPage />} />
                <Route path="investors" element={<InvestorsPage />} />
                <Route path="investors/settlement/:id" element={<InvestorSettlement />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
