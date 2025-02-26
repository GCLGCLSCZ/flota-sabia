
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Investors from "./pages/Investors";
import Calendar from "./pages/Calendar";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import DriversPage from "./pages/Drivers/DriversPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="investors" element={<Investors />} />
                <Route path="drivers" element={<DriversPage />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="payments" element={<Payments />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
