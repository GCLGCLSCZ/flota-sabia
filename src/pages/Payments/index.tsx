
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { PaymentSummary } from "./PaymentSummary";
import { PaymentHistory } from "./PaymentHistory";
import { NewPaymentDialog } from "./NewPaymentDialog";

const Payments = () => {
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false);

  return (
    <div className="space