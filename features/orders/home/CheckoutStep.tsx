import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'phosphor-react-native';
import GlassCard from '@/components/GlassCard';
import { errorMessage } from '@/lib/api/client';
import { displayMoney } from '@/lib/money';
import type { PaymentMethod } from '@/lib/api/types';
import { styles } from '@/features/orders/screens/homeStyles';
import { RUBBER_CHANGE_FEE } from './constants';
import PaymentMethodPicker from './PaymentMethodPicker';
import type { OrderDraft } from './useOrderDraft';

interface Props {
  draft: OrderDraft;
  rubberChangeRequested: boolean;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export default function CheckoutStep({
  draft,
  rubberChangeRequested,
  paymentMethod,
  onPaymentMethodChange,
  submitting,
  onBack,
  onConfirm,
}: Props) {
  const { amountUnits, totals, quote, quoteIsCurrent, currency } = draft;
  const confirmDisabled = amountUnits.length === 0 || !totals || !quoteIsCurrent || quote.isLoading || submitting;
  const grandTotal = totals ? totals.total + (rubberChangeRequested ? RUBBER_CHANGE_FEE : 0) : null;

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
            <Text style={styles.costSummaryTitle}>Cost Summary</Text>
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
                  <Text style={styles.costRowLabel}>Filling Station Fee</Text>
                  <Text style={styles.costRowValue}>{displayMoney(totals.distanceFee, currency)}</Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={styles.costRowLabel}>Service Fee</Text>
                  <Text style={styles.costRowValue}>{displayMoney(totals.serviceFee, currency)}</Text>
                </View>
              </>
            )}
            {rubberChangeRequested && (
              <View style={styles.costRow}>
                <Text style={styles.costRowLabel}>Cylinder Rubber Change</Text>
                <Text style={styles.costRowValue}>{displayMoney(RUBBER_CHANGE_FEE, currency)}</Text>
              </View>
            )}
            <View style={styles.costDivider} />
            <View style={styles.costRow}>
              <Text style={styles.costTotalLabel}>Total</Text>
              <Text style={styles.costTotalValue}>
                {grandTotal !== null && quoteIsCurrent ? displayMoney(grandTotal, currency) : '…'}
              </Text>
            </View>
            {rubberChangeRequested && (
              <Text style={styles.minFillNote}>The rubber change fee is collected in cash by your rider.</Text>
            )}
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
    </>
  );
}
