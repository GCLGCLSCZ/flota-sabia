
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

interface InvestorSettlementLinkProps {
  investorId: string;
}

const InvestorSettlementLink = ({ investorId }: InvestorSettlementLinkProps) => {
  return (
    <Button 
      variant="outline"
      size="sm"
      asChild
    >
      <Link to={`/investors/${investorId}/settlement`}>
        <FileText className="h-4 w-4 mr-2" />
        Rendición
      </Link>
    </Button>
  );
};

export default InvestorSettlementLink;
