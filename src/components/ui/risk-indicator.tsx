import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { RiskLevel } from '@/types/product';

interface RiskIndicatorProps {
  riskLevel: RiskLevel;
  className?: string;
}

const riskConfig = {
  [RiskLevel.SAFE]: {
    label: 'SAFE',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    icon: CheckCircle,
    ariaLabel: 'Product is safe to use',
  },
  [RiskLevel.UNSAFE]: {
    label: 'UNSAFE',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    icon: AlertTriangle,
    ariaLabel: 'Product has been cancelled due to safety concerns',
  },
  [RiskLevel.UNKNOWN]: {
    label: 'UNKNOWN',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    icon: HelpCircle,
    ariaLabel: 'Product safety status is unknown',
  },
};

export function RiskIndicator({ riskLevel, className }: RiskIndicatorProps) {
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, 'flex items-center gap-1 font-semibold', className)}
      aria-label={config.ariaLabel}
      role="status"
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  );
}
