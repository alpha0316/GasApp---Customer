import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretDown, Headset } from 'phosphor-react-native';
import { HELP_TOPICS } from '@/features/support/content';
import { BlockView, LargeHeader, SUPPORT_GREEN, TILE_BG } from '@/features/support/ui';
import type { RootStackParamList } from '@/types/navigation';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

// One help topic: its questions, each opening to show the answer, then a way to reach support.
export default function HelpTopic() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { topicId, articleId } = useRoute().params as RootStackParamList['HelpTopic'];
  const topic = HELP_TOPICS.find((t) => t.id === topicId) ?? HELP_TOPICS[0];
  const [open, setOpen] = useState<string | null>(articleId ?? null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <LargeHeader title={topic.title} showBack />

        <View style={styles.list}>
          {topic.articles.map((a) => {
            const expanded = open === a.id;
            return (
              <View key={a.id} style={styles.item}>
                <TouchableOpacity
                  style={styles.question}
                  onPress={() => toggle(a.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.questionText, expanded && styles.questionOpen]}>{a.question}</Text>
                  <View style={expanded && styles.caretOpen}>
                    <CaretDown size={18} color="rgba(0,0,0,0.45)" />
                  </View>
                </TouchableOpacity>
                {expanded && (
                  <View style={styles.answer}>
                    {a.body.map((block, i) => (
                      <BlockView key={i} block={block} />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.contact}
          onPress={() => navigation.navigate('ContactSupport', { subject: topic.title })}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <View style={styles.flex}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactDetail}>Contact a support agent</Text>
          </View>
          <View style={styles.contactIcon}>
            <Headset size={26} weight="duotone" color={SUPPORT_GREEN} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  list: { paddingHorizontal: 20, marginTop: 16 },
  item: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.15)' },
  question: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 18 },
  questionText: { flex: 1, fontSize: 17, color: '#111', lineHeight: 23 },
  questionOpen: { fontWeight: '600' },
  caretOpen: { transform: [{ rotate: '180deg' }] },
  answer: { gap: 12, paddingBottom: 20 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 28,
    padding: 18,
    borderRadius: 16,
    backgroundColor: TILE_BG,
  },
  contactTitle: { fontSize: 17, fontWeight: '600', color: '#111' },
  contactDetail: { fontSize: 14, color: 'rgba(0,0,0,0.55)', marginTop: 2 },
  contactIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(11,132,87,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
