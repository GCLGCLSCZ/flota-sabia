
import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/layout/Layout';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import VehiclesPage from './pages/Vehicles';
import NonWorkDaysPage from './pages/NonWorkDays';
import PaymentsPage from './pages/Payments';
import InvestorsPage from './pages/Investors';
import InvestorSettlement from './pages/Investors/components/InvestorSettlement';
import DriversPage from './pages/Drivers/DriversPage';
import SettingsPage from './pages/Settings';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider defaultTheme="light">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="nonworkdays" element={<NonWorkDaysPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="investors" element={<InvestorsPage />} />
              <Route path="investors/:investorId/settlement" element={<InvestorSettlement />} />
              <Route path="drivers" element={<DriversPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster richColors />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
