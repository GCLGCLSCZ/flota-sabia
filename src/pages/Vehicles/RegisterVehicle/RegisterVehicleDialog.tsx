
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/context/AppContext";
import { Vehicle, Investor, Driver } from "@/types";
import { VehicleStep } from "./VehicleStep";
import { InvestorStep } from "./InvestorStep";
import { DriverStep } from "./DriverStep";

interface RegisterVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterVehicleDialog = ({
  open,
  onOpenChange,
}: RegisterVehicleDialogProps) => {
  const { addVehicle, addInvestor, addDriver } = useApp();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [vehicleData, setVehicleData] = useState<Partial<Vehicle>>({});
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedDriverName, setSelectedDriverName] = useState("");
  const [selectedDriverPhone, setSelectedDriverPhone] = useState("");

  const handleNext = () => {
    if (step === 1 && !validateVehicleData()) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos del vehículo",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !selectedInvestor) {
      toast({
        title: "Inversor no seleccionado",
        description: "Por favor selecciona o crea un inversor",
        variant: "destructive",
      });
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateVehicleData = () => {
    return (
      vehicleData.plate &&
      vehicleData.brand &&
      vehicleData.model &&
      vehicleData.year &&
      vehicleData.dailyRate
    );
  };

  const handleNewInvestor = (
    investor: Omit<Investor, "id" | "vehicleCount" | "status" | "lastPayment">
  ) => {
    addInvestor({
      ...investor,
      vehicleCount: 0,
      status: "active",
      lastPayment: new Date().toISOString().split("T")[0],
    });
  };

  const handleNewDriver = (
    driver: Omit<Driver, "id" | "status" | "vehicleId">
  ) => {
    addDriver(driver);
  };

  const handleFinish = () => {
    if (!selectedDriverId && !selectedDriverName) {
      toast({
        title: "Chofer no seleccionado",
        description: "Por favor selecciona o crea un chofer",
        variant: "destructive",
      });
      return;
    }

    addVehicle({
      ...vehicleData as Required<Omit<Vehicle, "id">>,
      investor: selectedInvestor,
      driverId: selectedDriverId,
      driverName: selectedDriverName,
      driverPhone: selectedDriverPhone,
      status: vehicleData.status || "active",
    });

    toast({
      title: "Vehículo registrado",
      description: "El vehículo ha sido registrado exitosamente",
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setVehicleData({});
    setSelectedInvestor("");
    setSelectedDriverId("");
    setSelectedDriverName("");
    setSelectedDriverPhone("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "Datos del Vehículo"
              : step === 2
              ? "Selección de Inversor"
              : "Selección de Chofer"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <VehicleStep data={vehicleData} onChange={setVehicleData} />
          )}

          {step === 2 && (
            <InvestorStep
              selectedInvestor={selectedInvestor}
              onInvestorSelect={setSelectedInvestor}
              onNewInvestor={handleNewInvestor}
            />
          )}

          {step === 3 && (
            <DriverStep
              selectedDriver={selectedDriverId}
              onDriverSelect={(id, name, phone) => {
                setSelectedDriverId(id);
                setSelectedDriverName(name);
                setSelectedDriverPhone(phone);
              }}
              onNewDriver={handleNewDriver}
            />
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Atrás
            </Button>
            <Button
              onClick={step === 3 ? handleFinish : handleNext}
            >
              {step === 3 ? "Finalizar" : "Siguiente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
