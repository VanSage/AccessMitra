import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

const NEEDS = [
  { id: 'wheelchair', label: 'Wheelchair' },
  { id: 'visual', label: 'Low Vision' },
  { id: 'hearing', label: 'Deaf / HoH' },
  { id: 'elderly', label: 'Elderly' },
];

export default function ProfileScreen() {
  const [need, setNeed] = useState(null);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>Y</Text></View>
        <View>
          <Text style={styles.name}>You</Text>
          <Text style={styles.points}>120 points · New Contributor</Text>
        </View>
      </View>

      <Text style={styles.title}>My accessibility profile</Text>
      <View style={styles.grid}>
        {NEEDS.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.chip, need === n.id && styles.chipActive]}
            onPress={() => setNeed(need === n.id ? null : n.id)}
          >
            <Text style={[styles.chipText, need === n.id && styles.chipTextActive]}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.hint}>This preference re-ranks results on Home so the most relevant access features show first.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navy, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.xl, gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  name: { color: '#fff', fontWeight: '700', fontSize: 14 },
  points: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  title: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  chip: { width: '48%', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: radius.md, paddingVertical: 10, alignItems: 'center' },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  chipTextActive: { color: '#fff' },
  hint: { fontSize: 11, color: colors.sub },
});
