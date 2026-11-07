import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '@/features/orders/screens/homeStyles';
import type { PaymentMethod } from '@/lib/api/types';

const OPTIONS: { value: PaymentMethod; label: string; note: string }[] = [
  { value: 'cash', label: 'Cash on delivery', note: 'Payment is collected in cash on delivery.' },
  { value: 'paystack', label: 'Pay with Paystack', note: 'You pay with mobile money or card before a rider is assigned.' },
];

interface Props {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}

export default function PaymentMethodPicker({ value, onChange }: Props) {
  const selected = OPTIONS.find((o) => o.value === value);
  return (
    <View style={styles.paymentOptions}>
      {OPTIONS.map((option) => {
        const isSelected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
          >
            <View style={[styles.paymentRadio, isSelected && styles.paymentRadioSelected]}>
              {isSelected && <View style={styles.paymentRadioDot} />}
            </View>
            <Text style={styles.paymentOptionText}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
      <Text style={styles.paymentNote}>{selected?.note}</Text>
    </View>
  );
}
