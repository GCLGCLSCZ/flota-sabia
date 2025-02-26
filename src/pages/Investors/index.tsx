
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvestorList } from "./components/InvestorList";
import { InvestorDetails } from "./components/InvestorDetails";
import { useApp } from "@/context/AppContext";
import { Investor } from "@/types";

const Investors = () => {
  const { investors } = useApp();
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inversores</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los inversores y sus vehículos
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Inversor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <InvestorList
          investors={investors}
          onSelectInvestor={setSelectedInvestor}
        />
        {selectedInvestor && (
          <div className="lg:sticky lg:top-6">
            <InvestorDetails investor={selectedInvestor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Investors;
