import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Payments from "./pages/Payments";
import Investors from "./pages/Investors";
import Drivers from "./pages/Drivers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { AppProvider } from "./context/AppContext";
import Calendar from "./pages/Calendar";
import PaymentAnalysis from "./pages/PaymentAnalysis";
import InvestorSettlementHistory from "./pages/Investors/components/InvestorSettlementHistory";
import InvestorSettlement from "./pages/Investors/components/InvestorSettlement";

const routes = [
  {
    index: true,
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/vehicles",
    element: <Vehicles />
  },
  {
    path: "/payments",
    element: <Payments />
  },
  {
    path: "/payment-analysis",
    element: <PaymentAnalysis />
  },
  {
    path: "/investors",
    element: <Investors />
  },
  {
    path: "/investors/:id/settlements",
    element: <InvestorSettlementHistory />
  },
  {
    path: "/investors/:id/settlement/new",
    element: <InvestorSettlement />
  },
  {
    path: "/investors/:id/settlement/:settlementId",
    element: <InvestorSettlement />
  },
  {
    path: "/drivers",
    element: <Drivers />
  },
  {
    path: "/settings",
    element: <Settings />
  },
  {
    path: "/calendar",
    element: <Calendar />
  },
  {
    path: "*",
    element: <NotFound />
  }
];

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
              index={route.index}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
