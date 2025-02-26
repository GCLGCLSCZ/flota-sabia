
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change: string;
  color: string;
}

export const StatCard = ({ label, value, icon: Icon, change, color }: StatCardProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{change}</p>
        </div>
        <div className={`${color} bg-gray-50 p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
