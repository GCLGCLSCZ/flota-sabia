
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Vehicle } from "@/types";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import VehicleBasicInfoFields from "../../components/vehicle-form/VehicleBasicInfoFields";
import InvestorSelector from "../../components/vehicle-form/InvestorSelector";
import FinancialInfoFields from "../../components/vehicle-form/FinancialInfoFields";
import DriverSelector from "../../components/vehicle-form/DriverSelector";

interface AddVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddVehicleDialog = ({ isOpen, onClose }: AddVehicleDialogProps) => {
  const { addVehicle, investors, drivers } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Vehicle, "id">>({
    plate: "",
    brand: "",
    model: "",
    year: "",
    status: "active" as const,
    investor: "",
    dailyRate: 0,
    driverName: "",
    driverPhone: "",
    driverId: undefined,
    // Nuevos campos para el contrato
    contractStartDate: format(new Date(), "yyyy-MM-dd"),
    totalInstallments: 24, // Por defecto 24 cuotas (2 años)
    paidInstallments: 0,
    installmentAmount: 0,
    totalPaid: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.investor) {
      return; // No permitir enviar si no hay inversor seleccionado
    }
    const success = addVehicle(formData);
    if (success) {
      onClose();
    }
  };

  const handleDriverSelect = (driverId: string) => {
    const selectedDriver = drivers.find(d => d.id === driverId);
    if (selectedDriver) {
      setFormData({
        ...formData,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        driverPhone: selectedDriver.phone,
      });
    }
  };

  const goToInvestors = () => {
    onClose(); // Cerrar el diálogo
    navigate('/investors'); // Redirigir a la página de inversores
  };

  const handleFormChange = (newFormData: Partial<Vehicle>) => {
    setFormData(prev => ({ ...prev, ...newFormData }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <VehicleBasicInfoFields 
              formData={formData} 
              onChange={handleFormChange} 
            />
            
            <InvestorSelector 
              formData={formData} 
              onChange={handleFormChange} 
              investors={investors}
              onGoToInvestors={goToInvestors}
            />
            
            <FinancialInfoFields 
              formData={formData} 
              onChange={handleFormChange} 
            />
            
            <DriverSelector 
              formData={formData} 
              onChange={handleFormChange} 
              drivers={drivers}
              onDriverSelect={handleDriverSelect}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button 
              type="submit"
              disabled={!formData.investor || investors.length === 0}
            >
              Guardar Vehículo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;
