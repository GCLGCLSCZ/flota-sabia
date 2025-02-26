
import { Investor } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";

interface InvestorStepProps {
  selectedInvestor: string;
  onInvestorSelect: (investorName: string) => void;
  onNewInvestor: (investor: Omit<Investor, "id" | "vehicleCount" | "status" | "lastPayment">) => void;
}

export const InvestorStep = ({
  selectedInvestor,
  onInvestorSelect,
  onNewInvestor,
}: InvestorStepProps) => {
  const { investors } = useApp();
  const [isNewInvestor, setIsNewInvestor] = useState(false);
  const [newInvestorData, setNewInvestorData] = useState({
    name: "",
    contact: "",
    documentId: "",
    bankAccount: "",
  });

  const handleSubmitNewInvestor = () => {
    onNewInvestor(newInvestorData);
    onInvestorSelect(newInvestorData.name);
    setIsNewInvestor(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Seleccionar Inversor</Label>
        <Select
          value={isNewInvestor ? "new" : selectedInvestor}
          onValueChange={(value) => {
            if (value === "new") {
              setIsNewInvestor(true);
            } else {
              setIsNewInvestor(false);
              onInvestorSelect(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un inversor" />
          </SelectTrigger>
          <SelectContent>
            {investors.map((investor) => (
              <SelectItem key={investor.id} value={investor.name}>
                {investor.name}
              </SelectItem>
            ))}
            <SelectItem value="new">+ Nuevo Inversor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isNewInvestor && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="investorName">Nombre</Label>
            <Input
              id="investorName"
              value={newInvestorData.name}
              onChange={(e) =>
                setNewInvestorData({ ...newInvestorData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Teléfono</Label>
            <Input
              id="contact"
              value={newInvestorData.contact}
              onChange={(e) =>
                setNewInvestorData({ ...newInvestorData, contact: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentId">Documento de Identidad</Label>
            <Input
              id="documentId"
              value={newInvestorData.documentId}
              onChange={(e) =>
                setNewInvestorData({
                  ...newInvestorData,
                  documentId: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Cuenta Bancaria</Label>
            <Input
              id="bankAccount"
              value={newInvestorData.bankAccount}
              onChange={(e) =>
                setNewInvestorData({
                  ...newInvestorData,
                  bankAccount: e.target.value,
                })
              }
              required
            />
          </div>
          <Button
            className="col-span-2"
            onClick={handleSubmitNewInvestor}
          >
            Guardar Inversor
          </Button>
        </div>
      )}
    </div>
  );
};
