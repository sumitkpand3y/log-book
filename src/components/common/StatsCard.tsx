import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
}: StatsCardProps) => (
  <div
    className={`bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6 border-l-4 ${borderColor}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs lg:text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl lg:text-3xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-2 lg:p-3 ${bgColor} rounded-xl`}>
        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-current" />
      </div>
    </div>
  </div>
);