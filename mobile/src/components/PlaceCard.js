import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

const FEATURE_LABELS = { ramp: 'Ramp', restroom: 'Restroom', elevator: 'Lift', parking: 'Parking', audio: 'Audio cues' };

export default function PlaceCard({ place, onPress }) {
  const activeFeatures = Object.entries(place.features || {}).filter(([, v]) => v);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(place)} accessibilityRole="button" accessibilityLabel={`Open ${place.name}`}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        {place.distance_m != null && (
          <Text style={styles.dist}>{(place.distance_m / 1000).toFixed(1)} km</Text>
        )}
      </View>
      <Text style={styles.meta}>
        {place.category} · ★ {place.rating} · {place.verified_count} verified
      </Text>
      <View style={styles.badges}>
        {activeFeatures.map(([key]) => (
          <View key={key} style={styles.badge}>
            <Text style={styles.badgeText}>{FEATURE_LABELS[key] || key}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: colors.ink, flex: 1, marginRight: spacing.sm },
  dist: { fontSize: 11, color: colors.sub },
  meta: { fontSize: 11, color: colors.sub, marginTop: 2, marginBottom: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    backgroundColor: 'rgba(14,143,114,0.1)',
    borderColor: 'rgba(14,143,114,0.25)',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.teal },
});
