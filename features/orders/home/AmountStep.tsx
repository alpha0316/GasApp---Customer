import React from 'react';
import { Image, InputAccessoryView, Keyboard, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Check, X } from 'phosphor-react-native';
import GlassCard from '@/components/GlassCard';
import { errorMessage } from '@/lib/api/client';
import { displayMoney } from '@/lib/money';
import type { PaymentMethod } from '@/lib/api/types';
import { styles } from '@/features/orders/screens/homeStyles';
import { AMOUNT_INPUT_ACCESSORY_ID } from './constants';
import PaymentMethodPicker from './PaymentMethodPicker';
import type { OrderDraft } from './useOrderDraft';

interface Props {
  draft: OrderDraft;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export default function AmountStep({ draft, paymentMethod, onPaymentMethodChange, submitting, onBack, onConfirm }: Props) {
  const { amountUnits, totals, quote, quoteIsCurrent, currency, minFillMajor, fullFillFlags, fillAmounts } = draft;
  const confirmDisabled = amountUnits.length === 0 || !totals || !quoteIsCurrent || quote.isLoading || submitting;

  return (
    <>
      <GlassCard style={[styles.card, styles.stationCard]}>
        <View style={styles.amountHeaderRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={18} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.stationHeaderTitle, styles.amountHeaderTitle]}>Amount</Text>
            {totals?.stationName && <Text style={styles.amountHeaderSubtitle}>Pickup from {totals.stationName}</Text>}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {amountUnits.map((u, index) => (
            <View key={`${u.key}-${index}`} style={styles.amountUnitRow}>
              <TouchableOpacity
                style={styles.removeUnitButton}
                onPress={() => draft.removeUnit(index)}
                accessibilityLabel={`Remove ${u.title}`}
              >
                <X size={14} color="rgba(0,0,0,0.5)" weight="bold" />
              </TouchableOpacity>
              <Image source={u.image} style={styles.amountUnitImage} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                {u.countForKey > 1 && <Text style={styles.amountUnitOption}>Option {u.unitNumber}</Text>}
                <Text style={styles.amountUnitTitle}>{u.title}</Text>
                <TouchableOpacity style={styles.fullFillRow} onPress={() => draft.toggleFullFill(index)}>
                  <View style={[styles.checkbox, fullFillFlags[index] && styles.checkboxChecked]}>
                    {fullFillFlags[index] && <Check size={10} color="#fff" weight="bold" />}
                  </View>
                  <Text style={styles.fullFillText}>Full fill</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                editable={!fullFillFlags[index]}
                value={fullFillFlags[index] ? 'Full' : `GH ${fillAmounts[index] ?? minFillMajor}`}
                onChangeText={(text) => draft.changeFillAmount(index, text)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                inputAccessoryViewID={Platform.OS === 'ios' ? AMOUNT_INPUT_ACCESSORY_ID : undefined}
                style={[styles.amountInput, fullFillFlags[index] && styles.amountInputDisabled]}
              />
            </View>
          ))}

          <Text style={styles.minFillNote}>Min fill amount: GH {minFillMajor}</Text>

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
            <View style={styles.costDivider} />
            <View style={styles.costRow}>
              <Text style={styles.costTotalLabel}>Total</Text>
              <Text style={styles.costTotalValue}>{totals && quoteIsCurrent ? displayMoney(totals.total, currency) : '…'}</Text>
            </View>
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

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={AMOUNT_INPUT_ACCESSORY_ID}>
          <View style={styles.keyboardAccessory}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()}>
              <Text style={styles.keyboardAccessoryDone}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </>
  );
}
