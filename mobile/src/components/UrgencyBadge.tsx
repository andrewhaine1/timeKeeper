import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UrgencyLevel, URGENCY_COLORS, URGENCY_LABELS } from '@/src/utils/taskUrgency';

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  const color = URGENCY_COLORS[urgency];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{URGENCY_LABELS[urgency]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '600' },
});
