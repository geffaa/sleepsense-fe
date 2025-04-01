import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface InfoCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'amber' | 'red';
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  trend = 'stable',
  color = 'blue'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bgLight: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          textColor: 'text-green-700'
        };
      case 'amber':
        return {
          bgLight: 'bg-amber-50',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          textColor: 'text-amber-700'
        };
      case 'red':
        return {
          bgLight: 'bg-red-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          textColor: 'text-red-700'
        };
      case 'blue':
      default:
        return {
          bgLight: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-700'
        };
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      case 'stable':
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const colorClasses = getColorClasses();

  return (
    <Card className={`${colorClasses.bgLight} border-0`}>
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className={`${colorClasses.iconBg} p-3 rounded-full`}>
            <div className={colorClasses.iconColor}>
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-2xl font-bold ${colorClasses.textColor}`}>{value}</p>
            <div className="flex items-center mt-1">
              {getTrendIcon()}
              <span className="text-xs text-gray-500 ml-1">{description}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoCard;