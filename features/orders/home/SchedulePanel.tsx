import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '@/features/orders/screens/homeStyles';
import { formatTimeOfDay } from './constants';
import type { usePickupSchedule } from './usePickupSchedule';

type Schedule = ReturnType<typeof usePickupSchedule>;

const MODES = ['instantly', 'tomorrow', 'custom'] as const;

export default function SchedulePanel({ schedule }: { schedule: Schedule }) {
  const { pickupMode, scheduledHour, scheduledMinute } = schedule;

  const timePickerValue = new Date();
  timePickerValue.setHours(scheduledHour ?? 12, scheduledMinute, 0, 0);

  return (
    <>
      <View style={styles.scheduleHeaderRow}>
        <Text style={styles.sectionTitle}>Schedule Pick Up</Text>
        <TouchableOpacity onPress={schedule.saveSchedule}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentedControl}>
        {MODES.map((mode) => {
          const isSelected = pickupMode === mode;
          const hasTime = isSelected && mode !== 'instantly' && scheduledHour !== null;
          const dayLabel = schedule.dayLabel(mode);
          const label = hasTime ? `${dayLabel}, ${formatTimeOfDay(scheduledHour, scheduledMinute)}` : dayLabel;
          return (
            <TouchableOpacity
              key={mode}
              style={[styles.segment, isSelected && styles.segmentSelected]}
              onPress={() => {
                if (mode === 'custom') schedule.selectCustomDate();
                else if (mode === 'tomorrow') schedule.selectTomorrow();
                else schedule.selectInstantly();
              }}
            >
              <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {schedule.showDatePicker && (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            style={styles.datePicker}
            value={schedule.customDate ?? schedule.minimumScheduleDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={schedule.minimumScheduleDate}
            textColor="#000"
            accentColor="#007AFF"
            themeVariant="light"
            onChange={schedule.handleDateChange}
          />
        </View>
      )}

      {schedule.showTimePicker && (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            style={[styles.datePicker, styles.timePicker]}
            value={timePickerValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            textColor="#000"
            accentColor="#007AFF"
            themeVariant="light"
            onChange={schedule.handleTimeChange}
          />
        </View>
      )}
    </>
  );
}
