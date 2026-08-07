import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { api } from '../services/api';

const CATEGORIES = ['Broken Ramp', 'Blocked Path', 'No Restroom Access', 'Missing Signage', 'Broken Elevator', 'Other'];

export default function ReportScreen({ route, navigation }) {
  const [places, setPlaces] = useState([]);
  const [placeId, setPlaceId] = useState(route.params?.placeId || null);
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api.getPlaces().then((d) => setPlaces(d.results || [])).catch(() => {}); }, []);

  async function submit() {
    if (!placeId || !category) {
      Alert.alert('Missing info', 'Pick a place and a category first.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitReport({ placeId, category, description: desc });
      Alert.alert('Thank you', 'Report submitted. It needs 3 community confirmations to update the map.');
      setCategory(''); setDesc('');
      navigation.navigate('Community');
    } catch (err) {
      Alert.alert('Could not submit', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.title}>Report a barrier</Text>
      <Text style={styles.subtitle}>Geo-tagged and reviewed by the community before it changes the map.</Text>

      <Text style={styles.label}>Place</Text>
      <View style={styles.pillWrap}>
        {places.map((p) => (
          <TouchableOpacity key={p.id} style={[styles.pill, placeId === p.id && styles.pillActive]} onPress={() => setPlaceId(p.id)}>
            <Text style={[styles.pillText, placeId === p.id && styles.pillTextActive]} numberOfLines={1}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>What's wrong?</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} style={[styles.gridItem, category === c && styles.gridItemActive]} onPress={() => setCategory(c)}>
            <Text style={[styles.gridText, category === c && styles.gridTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Details</Text>
      <TextInput
        style={styles.textarea}
        multiline
        numberOfLines={4}
        placeholder="What did you find?"
        placeholderTextColor={colors.sub}
        value={desc}
        onChangeText={setDesc}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Submitting…' : 'Submit report'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 12, color: colors.sub, marginTop: 2, marginBottom: spacing.lg },
  label: { fontSize: 10, fontWeight: '700', color: colors.sub, letterSpacing: 0.5, marginBottom: 6, marginTop: spacing.md, textTransform: 'uppercase' },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, maxWidth: 180 },
  pillActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  pillText: { fontSize: 12, color: colors.ink, fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '48%', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 10 },
  gridItemActive: { backgroundColor: colors.amber, borderColor: colors.amber },
  gridText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  gridTextActive: { color: '#fff' },
  textarea: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: radius.md, padding: spacing.md, fontSize: 13, color: colors.ink, textAlignVertical: 'top', minHeight: 90 },
  submitBtn: { backgroundColor: colors.amber, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.xl },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
