
import React from 'react';
import { useToast } from "@/hooks/use-toast";
import NewPaymentDialog from './components/NewPaymentDialog';
import PaymentHistory from './components/PaymentHistory';
import PaymentSummary from './components/PaymentSummary';

const PaymentsPage = () => {
  const { toast } = useToast();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pagos</h1>
        <NewPaymentDialog />
      </div>
      
      <PaymentSummary />
      <PaymentHistory />
    </div>
  );
};

export default PaymentsPage;
