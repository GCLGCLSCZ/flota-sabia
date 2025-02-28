
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

interface InvestorSettlementLinkProps {
  investorId: string;
}

const InvestorSettlementLink = ({ investorId }: InvestorSettlementLinkProps) => {
  return (
    <Link to={`/investors/${investorId}/settlements`}>
      <Button
        variant="ghost"
        size="icon"
        title="Ver rendiciones"
      >
        <FileText className="h-4 w-4" />
      </Button>
    </Link>
  );
};

export default InvestorSettlementLink;
