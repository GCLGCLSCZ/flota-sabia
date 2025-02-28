
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Vehicle } from "@/types";
import NonWorkDaysPage from "./NonWorkDaysPage";

export default function NonWorkDaysPageWrapper() {
  const { vehicles } = useApp();
  const [activeVehicles, setActiveVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    setActiveVehicles(vehicles.filter(v => v.status === 'active'));
  }, [vehicles]);

  return <NonWorkDaysPage vehicles={activeVehicles} />;
}
