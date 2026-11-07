import { useState } from 'react';
import { Platform } from 'react-native';
import { resolvePickupTime, type PickupMode } from '@/features/orders/pickup';
import { glide } from './glide';
import { formatTimeOfDay } from './constants';

type PickerEvent = { type?: string };

const formatCustomDate = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// Pickup time chosen with the schedule picker. The server does not check opening hours.
export function usePickupSchedule(onContinue: () => void) {
  const [scheduleView, setScheduleView] = useState(false);
  const [pickupMode, setPickupMode] = useState<PickupMode>('instantly');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickupLabel, setPickupLabel] = useState('Now');
  // Time-of-day paired with pickupMode's date — null means "no specific
  // time chosen yet" (e.g. mode is still 'instantly').
  const [scheduledHour, setScheduledHour] = useState<number | null>(null);
  const [scheduledMinute, setScheduledMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const minimumScheduleDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const completeSchedule = (
    mode: PickupMode,
    date: Date | null,
    hour: number | null,
    minute: number,
    continueOrder: boolean,
  ) => {
    const dayLabel =
      mode === 'instantly' ? 'Now' : mode === 'tomorrow' ? 'Tomorrow' : date ? formatCustomDate(date) : 'Pick Date';
    const label = mode !== 'instantly' && hour !== null ? `${dayLabel}, ${formatTimeOfDay(hour, minute)}` : dayLabel;
    glide();
    setPickupLabel(label);
    setScheduleView(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    if (continueOrder) onContinue();
  };

  // Android closes the picker itself; iOS reports every spin. Returns the chosen date when final.
  const acceptPickerChange = (
    setShow: (show: boolean) => void,
    event: PickerEvent,
    date?: Date,
  ): Date | null => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event?.type !== 'set' || !date) return null;
    } else if (!date) {
      return null;
    }
    return date;
  };

  const handleDateChange = (event: PickerEvent, date?: Date) => {
    const picked = acceptPickerChange(setShowDatePicker, event, date);
    if (!picked) return;
    setCustomDate(picked);
    setPickupMode('custom');
    setShowDatePicker(false);
    // A date alone isn't a full schedule — immediately follow up with a
    // time picker so a custom schedule always captures both.
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: PickerEvent, date?: Date) => {
    const picked = acceptPickerChange(setShowTimePicker, event, date);
    if (!picked) return;
    const hour = picked.getHours();
    const minute = picked.getMinutes();
    setScheduledHour(hour);
    setScheduledMinute(minute);
    completeSchedule(pickupMode, customDate, hour, minute, false);
  };

  return {
    scheduleView,
    pickupMode,
    customDate,
    showDatePicker,
    pickupLabel,
    scheduledHour,
    scheduledMinute,
    showTimePicker,
    minimumScheduleDate,
    openSchedule: () => {
      glide();
      setScheduleView(true);
    },
    selectCustomDate: () => {
      setPickupMode('custom');
      setShowDatePicker(true);
    },
    selectTomorrow: () => {
      setPickupMode('tomorrow');
      // Tomorrow alone isn't a full schedule — immediately follow up with a
      // time picker so a general schedule always captures both.
      setShowTimePicker(true);
    },
    selectInstantly: () => {
      setPickupMode('instantly');
      setScheduledHour(null);
    },
    saveSchedule: () => completeSchedule(pickupMode, customDate, scheduledHour, scheduledMinute, false),
    continueFromSchedule: () => completeSchedule(pickupMode, customDate, scheduledHour, scheduledMinute, true),
    handleDateChange,
    handleTimeChange,
    pickupTime: () => resolvePickupTime(pickupMode, customDate, scheduledHour, scheduledMinute),
    dayLabel: (mode: PickupMode) =>
      mode === 'instantly' ? 'Instantly' : mode === 'tomorrow' ? 'Tomorrow' : customDate ? formatCustomDate(customDate) : 'Pick Date',
  };
}
