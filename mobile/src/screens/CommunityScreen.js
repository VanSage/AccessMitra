import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { api } from '../services/api';

export default function CommunityScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [lb, rp] = await Promise.all([api.getLeaderboard(), api.listReports()]);
    setLeaderboard(lb.results || []);
    setReports(rp.results || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function upvote(id) {
    await api.upvoteReport(id);
    load();
  }

  return (
    <FlatList
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Top verifiers</Text>
          <View style={styles.lbCard}>
            {leaderboard.map((u, i) => (
              <View key={u.name + i} style={styles.lbRow}>
                <Text style={styles.lbRank}>{i + 1}</Text>
                <Text style={styles.lbName}>{u.name}</Text>
                <Text style={styles.lbPoints}>{u.points}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.title, { marginTop: spacing.lg }]}>Recent reports</Text>
        </View>
      }
      data={reports}
      keyExtractor={(r) => String(r.id)}
      renderItem={({ item }) => (
        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportPlace}>{item.place_name}</Text>
            {item.status === 'verified' ? (
              <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Verified</Text></View>
            ) : (
              <View style={styles.pendingBadge}><Text style={styles.pendingText}>Pending · {item.upvotes}/3</Text></View>
            )}
          </View>
          <Text style={styles.reportCategory}>{item.category}</Text>
          {item.description ? <Text style={styles.reportDesc}>{item.description}</Text> : null}
          {item.status !== 'verified' && (
            <TouchableOpacity style={styles.upvoteBtn} onPress={() => upvote(item.id)}>
              <Text style={styles.upvoteText}>Confirm I saw this too</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      contentContainerStyle={styles.screen}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  lbCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, overflow: 'hidden' },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  lbRank: { width: 20, color: colors.sub, fontWeight: '700', fontSize: 13 },
  lbName: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink },
  lbPoints: { fontSize: 13, fontWeight: '700', color: colors.navy },
  reportCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reportPlace: { fontSize: 13, fontWeight: '700', color: colors.ink, flex: 1 },
  verifiedBadge: { backgroundColor: colors.teal, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  pendingBadge: { backgroundColor: 'rgba(232,163,61,0.15)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  pendingText: { color: colors.amberDark, fontSize: 10, fontWeight: '700' },
  reportCategory: { fontSize: 11, fontWeight: '700', color: colors.navy, marginTop: 4 },
  reportDesc: { fontSize: 12, color: colors.sub, marginTop: 4 },
  upvoteBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(14,143,114,0.4)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, marginTop: spacing.sm },
  upvoteText: { fontSize: 11, fontWeight: '700', color: colors.teal },
});
