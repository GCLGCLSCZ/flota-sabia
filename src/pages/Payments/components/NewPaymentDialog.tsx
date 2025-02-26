
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Car, DollarSign } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Vehicle } from "@/types";

interface NewPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  onSubmit: (paymentData: any) => void;
}

export const NewPaymentDialog = ({ open, onOpenChange, vehicles, onSubmit }: NewPaymentDialogProps) => {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [amount, setAmount] = React.useState("");
  const [concept, setConcept] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "transfer">("cash");
  const [bankName, setBankName] = React.useState("Ganadero");
  const [transferNumber, setTransferNumber] = React.useState("");
  const [customBank, setCustomBank] = React.useState("");
  const [showCustomBank, setShowCustomBank] = React.useState(false);

  const generateReceiptNumber = () => {
    return `REC-${Date.now()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedDate || !amount || !concept) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const paymentData = {
      vehicleId: selectedVehicle,
      amount: parseFloat(amount),
      date: selectedDate.toISOString().split('T')[0],
      concept,
      status: "completed" as const,
      paymentMethod,
      receiptNumber: generateReceiptNumber(),
      ...(paymentMethod === "transfer" && {
        bankName: customBank || bankName,
        transferNumber,
      }),
    };

    onSubmit(paymentData);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedVehicle("");
    setSelectedDate(new Date());
    setAmount("");
    setConcept("");
    setPaymentMethod("cash");
    setBankName("Ganadero");
    setTransferNumber("");
    setCustomBank("");
    setShowCustomBank(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Pago</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Vehículo</Label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>{vehicle.plate} - {vehicle.model}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Método de Pago</Label>
            <Select value={paymentMethod} onValueChange={(value: "cash" | "transfer") => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "transfer" && (
            <>
              <div className="space-y-2">
                <Label>Banco</Label>
                <Select
                  value={showCustomBank ? "otro" : bankName}
                  onValueChange={(value) => {
                    if (value === "otro") {
                      setShowCustomBank(true);
                    } else {
                      setShowCustomBank(false);
                      setBankName(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ganadero">Banco Ganadero</SelectItem>
                    <SelectItem value="otro">Otro banco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showCustomBank && (
                <div className="space-y-2">
                  <Label>Nombre del Banco</Label>
                  <Input
                    value={customBank}
                    onChange={(e) => {
                      setCustomBank(e.target.value);
                      setBankName(e.target.value);
                    }}
                    placeholder="Ingresa el nombre del banco"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Número de Transferencia</Label>
                <Input
                  value={transferNumber}
                  onChange={(e) => setTransferNumber(e.target.value)}
                  placeholder="Ej: TRF123456"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Monto</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Concepto</Label>
            <Input
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Renta semanal"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              Registrar Pago
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
