import { useMemo, useState } from 'react';
import { useCylinders, useSettings } from '@/features/catalog/hooks';
import { groupUnits, type PlanUnit } from '@/features/orders/orderPlan';
import { useGroupQuotes } from '@/features/orders/hooks';
import { displayMoney } from '@/lib/money';
import { useDebounced } from '@/lib/useDebounced';
import { CYLINDER_IMAGES } from './constants';

// What the customer is building: cylinders per size, the amount for each cylinder and
// the server quote for it. Prices come from the server; the client only picks amounts.
export function useOrderDraft(
  deliveryPoint: { latitude: number; longitude: number },
  quoteEnabled: boolean,
) {
  const settingsQuery = useSettings();
  const cylindersQuery = useCylinders();
  const settings = settingsQuery.data;
  const cylinders = useMemo(() => cylindersQuery.data ?? [], [cylindersQuery.data]);
  const [quantities, setQuantities] = useState<Record<string, number>>({ small: 1 });
  // Whole major units (GH) typed per cylinder; converted to pesewas for the API.
  const [fillAmounts, setFillAmounts] = useState<number[]>([]);
  const [fullFillFlags, setFullFillFlags] = useState<boolean[]>([]);

  const currency = settings?.currency ?? 'GHS';
  const stepMinor = settings?.gasAmountStep ?? 100;
  const minFillMajor = Math.ceil((settings?.minGasAmount ?? 0) / 100);

  const amountUnits = cylinders.flatMap((c) =>
    Array.from({ length: quantities[c.size] ?? 0 }, (_, i) => ({
      key: c.size,
      title: `${c.name} Size`,
      image: CYLINDER_IMAGES[c.size],
      fullPrice: c.fullPrice,
      unitNumber: i + 1,
      countForKey: quantities[c.size] ?? 0,
    })),
  );

  // Pesewas per cylinder: a multiple of the step, between the minimum and the full price.
  const toGasAmount = (major: number, fullPrice: number) => {
    const snapped = Math.round((major * 100) / stepMinor) * stepMinor;
    return Math.min(Math.max(snapped, settings?.minGasAmount ?? 0), fullPrice);
  };

  const planUnits: PlanUnit[] = amountUnits.map((u, index) => ({
    size: u.key,
    fullFill: !!fullFillFlags[index],
    gasAmount: toGasAmount(fillAmounts[index] ?? minFillMajor, u.fullPrice),
  }));
  const planKey = JSON.stringify(planUnits);
  const debouncedPlanKey = useDebounced(planKey, 300);
  const groups = useMemo(() => groupUnits(JSON.parse(debouncedPlanKey) as PlanUnit[]), [debouncedPlanKey]);
  const quote = useGroupQuotes(
    groups,
    { lat: deliveryPoint.latitude, lng: deliveryPoint.longitude },
    quoteEnabled,
  );

  const unitGasText = (index: number) => {
    const unit = amountUnits[index];
    if (!unit) return displayMoney(0, currency);
    return displayMoney(planUnits[index].fullFill ? unit.fullPrice : planUnits[index].gasAmount, currency);
  };

  return {
    cylindersQuery,
    cylinders,
    currency,
    minFillMajor,
    quantities,
    amountUnits,
    fullFillFlags,
    fillAmounts,
    groups,
    quote,
    totals: quote.totals,
    quoteIsCurrent: planKey === debouncedPlanKey,
    unitGasText,
    isOrderDisabled: cylinders.every((c) => (quantities[c.size] ?? 0) === 0),
    changeQuantity: (key: string, delta: number) =>
      setQuantities((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) })),
    prepareAmounts: () => {
      setFillAmounts(amountUnits.map(() => minFillMajor));
      setFullFillFlags(amountUnits.map(() => false));
    },
    toggleFullFill: (index: number) =>
      setFullFillFlags((prev) => prev.map((f, i) => (i === index ? !f : f))),
    changeFillAmount: (index: number, raw: string) => {
      const digits = raw.replace(/[^0-9]/g, '');
      const value = digits ? parseInt(digits, 10) : 0;
      const maxMajor = Math.floor((amountUnits[index]?.fullPrice ?? Infinity) / 100);
      const clamped = Math.min(Math.max(value, minFillMajor), maxMajor);
      setFillAmounts((prev) => prev.map((a, i) => (i === index ? clamped : a)));
    },
    removeUnit: (index: number) => {
      const unit = amountUnits[index];
      if (!unit) return;
      setQuantities((prev) => ({ ...prev, [unit.key]: Math.max(0, (prev[unit.key] ?? 0) - 1) }));
      setFillAmounts((prev) => prev.filter((_, i) => i !== index));
      setFullFillFlags((prev) => prev.filter((_, i) => i !== index));
    },
    reset: () => {
      setQuantities({ small: 1 });
      setFillAmounts([]);
      setFullFillFlags([]);
    },
  };
}

export type OrderDraft = ReturnType<typeof useOrderDraft>;
