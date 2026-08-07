import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { api } from '../services/api';

const STEP_LABEL = { walk: 'Walk', ramp: 'Ramp', elevator: 'Lift', alert: 'Alert', arrive: 'Arrived' };

function RouteList({ navigation }) {
  const [places, setPlaces] = useState([]);
  useEffect(() => { api.getPlaces().then((d) => setPlaces(d.results || [])).catch(() => {}); }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Pick a destination for a step-free route</Text>
      <FlatList
        data={places}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('RouteDetail', { placeId: item.id })}>
            <Text style={styles.rowText}>{item.name}</Text>
            <Text style={styles.rowArrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function RouteDetail({ route }) {
  const { placeId } = route.params;
  const [data, setData] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getRoute(placeId);
      setData(res);
      setStepIndex(0);
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !data) return <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.navy} />;

  const step = data.steps[stepIndex];
  const done = stepIndex >= data.steps.length - 1;

  return (
    <View style={styles.screen}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>STEP-FREE ROUTE</Text>
        <Text style={styles.summaryMeta}>
          {(data.totalDistanceM / 1000).toFixed(1)} km · ~{data.estimatedMinutes} min · source: {data.source}
        </Text>
      </View>

      <View style={styles.ribbon}>
        {data.steps.map((s, i) => (
          <View
            key={i}
            style={[
              styles.ribbonSeg,
              { backgroundColor: i < stepIndex ? colors.teal : i === stepIndex ? (s.type === 'alert' ? colors.amber : colors.navy) : colors.line },
            ]}
          />
        ))}
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepBadge}>{STEP_LABEL[step.type] || step.type}</Text>
        <Text style={styles.stepText}>{step.instruction}</Text>
        {step.distanceM ? <Text style={styles.stepDist}>{step.distanceM} m</Text> : null}
      </View>

      {!done ? (
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setStepIndex((i) => Math.min(i + 1, data.steps.length - 1))}>
          <Text style={styles.primaryBtnText}>Next step</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.primaryBtn, { backgroundColor: colors.teal }]}>
          <Text style={styles.primaryBtnText}>You've arrived</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: spacing.md },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
  },
  rowText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  rowArrow: { color: colors.navy, fontSize: 16 },
  summaryCard: { backgroundColor: colors.navy, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  summaryMeta: { color: '#fff', fontSize: 13, marginTop: 4 },
  ribbon: { flexDirection: 'row', gap: 4, marginBottom: spacing.lg },
  ribbonSeg: { flex: 1, height: 8, borderRadius: 99 },
  stepCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  stepBadge: { fontSize: 10, fontWeight: '700', color: colors.teal, marginBottom: 4 },
  stepText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  stepDist: { fontSize: 11, color: colors.sub, marginTop: 4 },
  primaryBtn: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export { RouteList, RouteDetail };
