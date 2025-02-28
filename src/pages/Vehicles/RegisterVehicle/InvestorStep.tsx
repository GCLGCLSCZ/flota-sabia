
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Investor } from "@/types";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";

interface InvestorStepProps {
  onNext: () => void;
  onBack: () => void;
  investorName: string;
  setInvestorName: (name: string) => void;
}

const InvestorStep = ({ onNext, onBack, investorName, setInvestorName }: InvestorStepProps) => {
  const { investors, addInvestor } = useApp();
  const [selectedInvestor, setSelectedInvestor] = useState<string>("existing");
  const [newInvestorName, setNewInvestorName] = useState("");
  const [newInvestorContact, setNewInvestorContact] = useState("");
  const [newInvestorDocument, setNewInvestorDocument] = useState("");
  const [newInvestorBankAccount, setNewInvestorBankAccount] = useState("");
  const [newInvestorFirstName, setNewInvestorFirstName] = useState("");
  const [newInvestorLastName, setNewInvestorLastName] = useState("");

  useEffect(() => {
    if (investorName) {
      setSelectedInvestor("existing");
    }
  }, [investorName]);

  const handleAddInvestor = async () => {
    try {
      const result = await addInvestor({
        name: newInvestorName,
        contact: newInvestorContact,
        documentId: newInvestorDocument,
        bankAccount: newInvestorBankAccount,
        firstName: newInvestorFirstName,
        lastName: newInvestorLastName
      });

      if (result) {
        setInvestorName(newInvestorName);
        toast({
          title: "Inversionista agregado",
          description: "El inversionista ha sido agregado exitosamente",
        });
        onNext();
      }
    } catch (error) {
      toast({
        title: "Error al agregar inversionista",
        description: "No se pudo agregar el inversionista",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    if (selectedInvestor === "new") {
      if (!newInvestorName || !newInvestorContact || !newInvestorDocument) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive",
        });
        return;
      }
      handleAddInvestor();
    } else {
      if (!investorName) {
        toast({
          title: "Selecciona un inversionista",
          description: "Por favor selecciona un inversionista existente",
          variant: "destructive",
        });
        return;
      }
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Paso 2: Información del Inversionista</h2>
        <p className="text-muted-foreground">Selecciona o registra un inversionista para este vehículo.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={selectedInvestor === "existing" ? "default" : "outline"}
              className="w-full"
              onClick={() => setSelectedInvestor("existing")}
            >
              Inversionista Existente
            </Button>
            <Button
              type="button"
              variant={selectedInvestor === "new" ? "default" : "outline"}
              className="w-full"
              onClick={() => setSelectedInvestor("new")}
            >
              Nuevo Inversionista
            </Button>
          </div>
        </div>

        {selectedInvestor === "existing" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Select value={investorName} onValueChange={setInvestorName}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar inversionista" />
                </SelectTrigger>
                <SelectContent>
                  {investors.map((investor: Investor) => (
                    <SelectItem key={investor.id} value={investor.name}>
                      {investor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Nombre
                </label>
                <Input
                  id="firstName"
                  value={newInvestorFirstName}
                  onChange={(e) => setNewInvestorFirstName(e.target.value)}
                  placeholder="Nombre"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Apellido
                </label>
                <Input
                  id="lastName"
                  value={newInvestorLastName}
                  onChange={(e) => setNewInvestorLastName(e.target.value)}
                  placeholder="Apellido"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nombre completo
              </label>
              <Input
                id="fullName"
                value={newInvestorName}
                onChange={(e) => setNewInvestorName(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Teléfono de contacto
              </label>
              <Input
                id="phone"
                value={newInvestorContact}
                onChange={(e) => setNewInvestorContact(e.target.value)}
                placeholder="Teléfono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="document" className="text-sm font-medium">
                CI/NIT
              </label>
              <Input
                id="document"
                value={newInvestorDocument}
                onChange={(e) => setNewInvestorDocument(e.target.value)}
                placeholder="CI/NIT"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bankAccount" className="text-sm font-medium">
                Cuenta bancaria (opcional)
              </label>
              <Input
                id="bankAccount"
                value={newInvestorBankAccount}
                onChange={(e) => setNewInvestorBankAccount(e.target.value)}
                placeholder="Cuenta bancaria"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <Button onClick={handleSubmit}>Siguiente</Button>
      </div>
    </div>
  );
};

export default InvestorStep;
