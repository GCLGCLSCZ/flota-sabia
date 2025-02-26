
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Driver } from "@/types";
import { DriversHeader } from "./components/DriversHeader";
import { AddDriverForm } from "./components/AddDriverForm";
import { DriversTable } from "./components/DriversTable";
import { EditDriverDialog } from "./components/EditDriverDialog";

const DriversPage = () => {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  return (
    <div className="space-y-6">
      <Dialog>
        <DriversHeader />
        <AddDriverForm />
      </Dialog>

      <DriversTable onEdit={setEditingDriver} />

      <EditDriverDialog
        driver={editingDriver}
        onClose={() => setEditingDriver(null)}
      />
    </div>
  );
};

export default DriversPage;
