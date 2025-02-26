import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface NewPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  vehicles: { id: string; plate: string; model: string }[];
  onPaymentSubmit: (paymentData: any) => void;
  generateReceiptNumber: () => string;
}

const NewPaymentDialog: React.FC<NewPaymentDialogProps> = ({ open, setOpen, vehicles, onPaymentSubmit, generateReceiptNumber }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [amount, setAmount] = useState<string>("");
  const [concept, setConcept] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [bankName, setBankName] = useState<string>("Ganadero");
  const [transferNumber, setTransferNumber] = useState<string>("");
  const [customBank, setCustomBank] = useState<string>("");
  const [showCustomBank, setShowCustomBank] = useState<boolean>(false);
  const { toast } = useToast();

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
      date: selectedDate.toISOString().split('T')[0], // Convertimos la fecha a string en formato YYYY-MM-DD
      concept,
      status: "completed" as const,
      paymentMethod,
      receiptNumber: generateReceiptNumber(),
      ...(paymentMethod === "transfer" && {
        bankName: customBank || bankName,
        transferNumber,
      }),
    };

    onPaymentSubmit(paymentData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Pago</DialogTitle>
          <DialogDescription>
            Realiza el registro de un nuevo pago.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle" className="text-right">
              Vehículo
            </Label>
            <Select
              value={selectedVehicle}
              onValueChange={setSelectedVehicle}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentMethod" className="text-right">
              Método de Pago
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: "cash" | "transfer") => setPaymentMethod(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "transfer" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bankName" className="text-right">
                  Banco
                </Label>
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
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un banco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ganadero">Banco Ganadero</SelectItem>
                    <SelectItem value="otro">Otro banco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showCustomBank && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customBank" className="text-right">
                    Nombre del Banco
                  </Label>
                  <Input
                    id="customBank"
                    value={customBank}
                    onChange={(e) => {
                      setCustomBank(e.target.value);
                      setBankName(e.target.value);
                    }}
                    className="col-span-3"
                    placeholder="Ingresa el nombre del banco"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transferNumber" className="text-right">
                  Número de Transferencia
                </Label>
                <Input
                  id="transferNumber"
                  value={transferNumber}
                  onChange={(e) => setTransferNumber(e.target.value)}
                  className="col-span-3"
                  placeholder="Ej: TRF123456"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Monto
            </Label>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="concept" className="text-right">
              Concepto
            </Label>
            <Input
              id="concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Renta semanal"
            />
          </div>
        </div>
        <Button type="submit" onClick={handleSubmit}>Registrar Pago</Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewPaymentDialog;
