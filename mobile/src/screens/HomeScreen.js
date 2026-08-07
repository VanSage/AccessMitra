import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { api } from '../services/api';
import PlaceCard from '../components/PlaceCard';

const CATEGORIES = ['All', 'Transit', 'Shopping', 'Food', 'Park', 'Education', 'Health'];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const data = await api.getPlaces(params);
      setPlaces(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.screen}>
      <TextInput
        style={styles.search}
        placeholder="Where are you going?"
        placeholderTextColor={colors.sub}
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Search places"
      />

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {loading && <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.navy} />}
      {error && <Text style={styles.error}>Could not reach the API: {error}</Text>}

      {!loading && !error && (
        <FlatList
          data={places}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => (
            <PlaceCard place={item} onPress={(p) => navigation.navigate('Routes', { screen: 'RouteDetail', params: { placeId: p.id } })} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No places match — try another filter.</Text>}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  search: {
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 14, color: colors.ink, marginBottom: spacing.md,
  },
  chipRow: { marginBottom: spacing.lg, flexGrow: 0 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, marginRight: 8,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.ink },
  chipTextActive: { color: '#fff' },
  error: { color: colors.amberDark, fontSize: 12, marginTop: spacing.lg },
  empty: { color: colors.sub, fontSize: 13, textAlign: 'center', marginTop: spacing.xl },
});
