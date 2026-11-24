import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LEGAL_UPDATED, PRIVACY, TERMS } from '@/features/support/content';
import { BlockView, LargeHeader } from '@/features/support/ui';

type Tab = 'terms' | 'privacy';

// Terms of Service and Privacy Policy, switched with a segmented control.
export default function TermsPrivacy() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('terms');
  const scrollRef = useRef<ScrollView>(null);
  const sections = tab === 'terms' ? TERMS : PRIVACY;

  const pick = (next: Tab) => {
    setTab(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <View style={styles.screen}>
      <LargeHeader title="Terms & Privacy" showBack />
      <View style={styles.segment} accessibilityRole="tablist">
        {(['terms', 'privacy'] as const).map((t) => {
          const on = tab === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.segmentItem, on && styles.segmentOn]}
              onPress={() => pick(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{t === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated {LEGAL_UPDATED}</Text>
        {sections.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            {s.body.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  segment: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 4,
    borderRadius: 14,
    backgroundColor: '#F1F2F2',
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentOn: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: { fontSize: 14, fontWeight: '600', color: 'rgba(0,0,0,0.5)' },
  segmentTextOn: { color: '#000' },
  body: { paddingHorizontal: 20, paddingTop: 16, gap: 24 },
  updated: { fontSize: 13, color: 'rgba(0,0,0,0.45)' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
});
