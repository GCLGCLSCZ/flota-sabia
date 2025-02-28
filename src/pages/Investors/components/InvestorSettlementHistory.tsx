
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, Trash2, MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useApp } from "@/context/AppContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Settlement {
  id: string;
  investorId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'pending' | 'completed';
}

const InvestorSettlementHistory = () => {
  const { id } = useParams<{ id: string }>();
  const { investors, settlements, removeSettlement } = useApp();
  const { toast } = useToast();
  const [investor, setInvestor] = useState(null);
  const [filteredSettlements, setFilteredSettlements] = useState<Settlement[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settlementToDelete, setSettlementToDelete] = useState<Settlement | null>(null);

  useEffect(() => {
    if (id) {
      const foundInvestor = investors.find((i) => i.id === id);
      if (foundInvestor) {
        setInvestor(foundInvestor);
      }
    }
  }, [id, investors]);

  useEffect(() => {
    if (investor && settlements) {
      const investorSettlements = settlements.filter(
        (settlement) => settlement.investorId === id
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setFilteredSettlements(investorSettlements);
    }
  }, [investor, settlements, id]);

  const confirmDelete = (settlement: Settlement) => {
    setSettlementToDelete(settlement);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (settlementToDelete) {
      try {
        await removeSettlement(settlementToDelete.id);
        toast({
          title: "Rendición eliminada",
          description: "La rendición ha sido eliminada correctamente",
        });
        setDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la rendición",
          variant: "destructive",
        });
      }
    }
  };

  const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "MMMM yyyy", { locale: es });
  };

  if (!investor) {
    return <div className="flex justify-center items-center h-48">Cargando...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-10">
      <div className="flex items-center justify-between mb-4">
        <Link to={`/investors`}>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver a Inversionistas
          </Button>
        </Link>
        <Link to={`/investors/${id}/settlement/new`}>
          <Button size="sm" className="h-8 gap-1">
            <Calendar className="h-4 w-4" />
            Nueva Rendición
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Rendiciones</CardTitle>
          <CardDescription>
            Rendiciones generadas para {investor.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSettlements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay rendiciones registradas para este inversionista
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSettlements.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell>
                      <div className="font-medium">
                        Rendición de {getMonthName(settlement.startDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(settlement.startDate), "dd/MM/yyyy")} - {format(new Date(settlement.endDate), "dd/MM/yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(settlement.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      Bs {settlement.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      Bs {settlement.paidAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      Bs {settlement.balance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        settlement.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400'
                      }`}>
                        {settlement.status === 'completed' ? 'Pagada' : 'Pendiente'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link to={`/investors/${id}/settlement/${settlement.id}`}>
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (settlement.status === 'pending') {
                              confirmDelete(settlement);
                            } else {
                              toast({
                                title: "No se puede eliminar",
                                description: "Las rendiciones pagadas no se pueden eliminar",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta rendición? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorSettlementHistory;
