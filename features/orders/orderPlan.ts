import type { CylinderSize } from '@/lib/api/types';

// One cylinder the customer picked on the amount step.
export interface PlanUnit {
  size: CylinderSize;
  fullFill: boolean;
  // Pesewas per cylinder. Ignored when fullFill is true.
  gasAmount: number;
}

// The API takes one size and one amount per order, with a cylinder count of 1-10.
// Units that share size and amount become one order.
export interface PlanGroup {
  key: string;
  size: CylinderSize;
  fullFill: boolean;
  gasAmount: number;
  cylinderCount: number;
}

const MAX_PER_ORDER = 10;

export function groupUnits(units: PlanUnit[]): PlanGroup[] {
  const groups: PlanGroup[] = [];
  for (const unit of units) {
    const amountKey = unit.fullFill ? 'full' : String(unit.gasAmount);
    const base = `${unit.size}:${amountKey}`;
    const open = groups.find((g) => g.key.startsWith(`${base}#`) && g.cylinderCount < MAX_PER_ORDER);
    if (open) {
      open.cylinderCount += 1;
    } else {
      const index = groups.filter((g) => g.key.startsWith(`${base}#`)).length;
      groups.push({
        key: `${base}#${index}`,
        size: unit.size,
        fullFill: unit.fullFill,
        gasAmount: unit.gasAmount,
        cylinderCount: 1,
      });
    }
  }
  return groups;
}

// Request fields shared by the quote and the order: fullFill XOR gasAmount.
export const amountFields = (g: PlanGroup) => (g.fullFill ? { fullFill: true as const } : { gasAmount: g.gasAmount });
