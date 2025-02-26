
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Driver } from "@/types";
import { useApp } from "@/context/AppContext";
import { DriversHeader } from "./components/DriversHeader";
import { AddDriverForm } from "./components/AddDriverForm";
import { DriversTable } from "./components/DriversTable";

const DriversPage = () => {
  const { updateDriver } = useApp();
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  const handleEditDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    updateDriver(editingDriver.id, editingDriver);
    setEditingDriver(null);
    toast({
      title: "Chofer actualizado",
      description: "Los datos del chofer han sido actualizados exitosamente.",
    });
  };

  return (
    <div className="space-y-6">
      <Dialog>
        <DriversHeader />
        <AddDriverForm />
      </Dialog>

      <DriversTable onEdit={setEditingDriver} />
    </div>
  );
};

export default DriversPage;
