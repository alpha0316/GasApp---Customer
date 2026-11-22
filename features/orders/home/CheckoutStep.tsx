import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Question } from 'phosphor-react-native';
import GlassCard from '@/components/GlassCard';
import { errorMessage } from '@/lib/api/client';
import { displayMoney, roundBreakdown } from '@/lib/money';
import type { PaymentMethod } from '@/lib/api/types';
import { styles } from '@/features/orders/screens/homeStyles';
import { RUBBER_CHANGE_FEE } from './constants';
import PaymentMethodPicker from './PaymentMethodPicker';
import FeeInfoSheet from './FeeInfoSheet';
import type { OrderDraft } from './useOrderDraft';

interface Props {
  draft: OrderDraft;
  rubberChangeRequested: boolean;
  // Distance surcharge for a station farther than the closest (pesewas), added to the Delivery Fee.
  stationExtraFee: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export default function CheckoutStep({
  draft,
  rubberChangeRequested,
  stationExtraFee,
  paymentMethod,
  onPaymentMethodChange,
  submitting,
  onBack,
  onConfirm,
}: Props) {
  const { amountUnits, totals, quote, quoteIsCurrent, currency } = draft;
  const confirmDisabled = amountUnits.length === 0 || !totals || !quoteIsCurrent || quote.isLoading || submitting;
  const rubberFee = rubberChangeRequested ? RUBBER_CHANGE_FEE : 0;
  const grandTotal = totals ? totals.total + stationExtraFee + rubberFee : null;
  // Whole cedis for cash: the lines are rounded together so they still add up to the rounded total.
  // Order: gas, Service Fee (station trip), Delivery Fee (rider), rubber change, anything else (tip).
  const [, serviceFeeShown, deliveryFeeShown, rubberFeeShown] = totals
    ? roundBreakdown([
        totals.gasTotal,
        totals.distanceFee,
        totals.serviceFee + stationExtraFee,
        rubberFee,
        totals.total - totals.gasTotal - totals.distanceFee - totals.serviceFee,
      ])
    : [];
  const [feeInfoOpen, setFeeInfoOpen] = useState(false);

  return (
    <>
      <GlassCard style={[styles.card, styles.stationCard]}>
        <View style={styles.amountHeaderRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={18} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.stationHeaderTitle, styles.amountHeaderTitle]}>Checkout</Text>
            {totals?.stationName && <Text style={styles.amountHeaderSubtitle}>Pickup from {totals.stationName}</Text>}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          <View style={styles.costSummaryBox}>
            <View style={localStyles.summaryHeader}>
              <Text style={styles.costSummaryTitle}>Cost Summary</Text>
              <TouchableOpacity
                onPress={() => setFeeInfoOpen(true)}
                hitSlop={10}
                style={localStyles.helpButton}
                accessibilityRole="button"
                accessibilityLabel="About fees and cancellation"
              >
                <Question size={16} weight="bold" color="#007AFF" />
              </TouchableOpacity>
            </View>
            {amountUnits.map((u, index) => (
              <View key={`cost-${u.key}-${index}`} style={styles.costRow}>
                <Text style={styles.costRowLabel}>
                  {u.title}
                  {u.countForKey > 1 ? ` #${u.unitNumber}` : ''}
                </Text>
                <Text style={styles.costRowValue}>{draft.unitGasText(index)}</Text>
              </View>
            ))}
            {totals && (
              <>
                <View style={styles.costRow}>
                  <Text style={styles.costRowLabel}>Service Fee</Text>
                  <Text style={styles.costRowValue}>{displayMoney(serviceFeeShown, currency)}</Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costRowLabel}>
                    Delivery Fee
                    {stationExtraFee > 0 && <Text style={localStyles.extraNote}>{'  '}incl. distance</Text>}
                  </Text>
                  <Text style={styles.costRowValue}>{displayMoney(deliveryFeeShown, currency)}</Text>
                </View>
              </>
            )}
            {rubberChangeRequested && (
              <View style={styles.costRow}>
                <Text style={styles.costRowLabel}>Cylinder Rubber Change</Text>
                <Text style={styles.costRowValue}>{displayMoney(rubberFeeShown ?? RUBBER_CHANGE_FEE, currency)}</Text>
              </View>
            )}
            <View style={styles.costDivider} />
            <View style={styles.costRow}>
              <Text style={styles.costTotalLabel}>Total</Text>
              <Text style={styles.costTotalValue}>
                {grandTotal !== null && quoteIsCurrent ? displayMoney(grandTotal, currency) : '…'}
              </Text>
            </View>
            <Text style={localStyles.roundNote}>Rounded to the nearest cedi for easy cash payment.</Text>
            {/* {rubberChangeRequested && (
              <Text style={styles.minFillNote}>The rubber change fee is collected in cash by your rider.</Text>
            )} */}
          </View>

          {quote.error && <Text style={styles.noLocationMatches}>{errorMessage(quote.error)}</Text>}

          <PaymentMethodPicker value={paymentMethod} onChange={onPaymentMethodChange} />
        </ScrollView>
      </GlassCard>

      <TouchableOpacity
        style={[styles.placeOrderButton, confirmDisabled && styles.placeOrderButtonDisabled]}
        disabled={confirmDisabled}
        onPress={onConfirm}
      >
        <Text style={styles.placeOrderText}>{submitting ? 'Placing…' : 'Confirm Order'}</Text>
      </TouchableOpacity>

      <FeeInfoSheet visible={feeInfoOpen} onClose={() => setFeeInfoOpen(false)} />
    </>
  );
}

const localStyles = StyleSheet.create({
  summaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  helpButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,122,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraNote: { fontSize: 11, color: '#C26A00', fontWeight: '600' },
  roundNote: { fontSize: 11, color: 'rgba(0,0,0,0.45)', marginTop: 2 },
});
