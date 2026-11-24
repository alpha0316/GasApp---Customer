import React from 'react';
import { Image, InputAccessoryView, Keyboard, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Check, X } from 'phosphor-react-native';
import GlassCard from '@/components/GlassCard';
import { CEDI, displayMoney } from '@/lib/money';
import { styles } from '@/features/orders/screens/homeStyles';
import { AMOUNT_INPUT_ACCESSORY_ID, RUBBER_CHANGE_FEE } from './constants';
import type { OrderDraft } from './useOrderDraft';

interface Props {
  draft: OrderDraft;
  rubberChangeRequested: boolean;
  onToggleRubberChange: () => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function AmountStep({ draft, rubberChangeRequested, onToggleRubberChange, onBack, onContinue }: Props) {
  const { amountUnits, totals, currency, minFillMajor, fullFillFlags, fillAmounts } = draft;
  const continueDisabled = amountUnits.length === 0;

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
                value={fullFillFlags[index] ? displayMoney(u.fullPrice, currency) : `${CEDI} ${fillAmounts[index] ?? minFillMajor}`}
                onChangeText={(text) => draft.changeFillAmount(index, text)}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                inputAccessoryViewID={Platform.OS === 'ios' ? AMOUNT_INPUT_ACCESSORY_ID : undefined}
                style={[styles.amountInput, fullFillFlags[index] && styles.amountInputDisabled]}
              />
            </View>
          ))}

          <Text style={styles.minFillNote}>Min fill amount: {displayMoney(minFillMajor * 100, currency)}</Text>

          <TouchableOpacity
            style={[styles.rubberChangeRow, rubberChangeRequested && styles.rubberChangeRowSelected]}
            onPress={onToggleRubberChange}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rubberChangeRequested }}
            accessibilityLabel="Request cylinder rubber change"
          >
            <Image
              source={require('@/assets/images/cylinderRubber.png')}
              style={styles.rubberChangeImage}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.rubberChangeTitle}>Request cylinder rubber change</Text>
              <Text style={styles.rubberChangeSubtitle}>Your rider brings a replacement gasket and swaps it on delivery.</Text>
              <Text style={styles.rubberChangeFee}>{displayMoney(RUBBER_CHANGE_FEE, currency)} </Text>
            </View>
            <View style={[styles.checkbox, rubberChangeRequested && styles.checkboxChecked]}>
              {rubberChangeRequested && <Check size={10} color="#fff" weight="bold" />}
            </View>
          </TouchableOpacity>
        </ScrollView>
      </GlassCard>

      <TouchableOpacity
        style={[styles.placeOrderButton, continueDisabled && styles.placeOrderButtonDisabled]}
        disabled={continueDisabled}
        onPress={onContinue}
      >
        <Text style={styles.placeOrderText}>Continue</Text>
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
