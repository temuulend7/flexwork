import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { router, useFocusEffect } from 'expo-router';

type JobStat = {
  id: string;
  title: string;
  company: string;
  views: number;
  chats: number;
  saves: number;
};

export default function StatsScreen() {
  const [stats, setStats] = useState<JobStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [totalSaves, setTotalSaves] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, company')
      .eq('employer_id', user.id);

    if (!jobs) { setLoading(false); return; }

    const jobStats: JobStat[] = await Promise.all(
      jobs.map(async (job) => {
        const { count: views } = await supabase
          .from('job_views')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id);

        const { count: chats } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id);

        const { count: saves } = await supabase
          .from('saved_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id);

        return {
          id: job.id,
          title: job.title,
          company: job.company,
          views: views || 0,
          chats: chats || 0,
          saves: saves || 0,
        };
      })
    );

    setStats(jobStats);
    setTotalViews(jobStats.reduce((sum, j) => sum + j.views, 0));
    setTotalChats(jobStats.reduce((sum, j) => sum + j.chats, 0));
    setTotalSaves(jobStats.reduce((sum, j) => sum + j.saves, 0));
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Статистик</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Нийт статистик */}
      <View style={styles.totalRow}>
        <View style={styles.totalBox}>
          <Text style={styles.totalNum}>{totalViews}</Text>
          <Text style={styles.totalLabel}>👁 Нийт үзсэн</Text>
        </View>
        <View style={[styles.totalBox, styles.totalBoxMiddle]}>
          <Text style={styles.totalNum}>{totalChats}</Text>
          <Text style={styles.totalLabel}>💬 Нийт чат</Text>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalNum}>{totalSaves}</Text>
          <Text style={styles.totalLabel}>❤️ Хадгалсан</Text>
        </View>
      </View>

      {/* Зар тус бүрийн статистик */}
      <Text style={styles.sectionTitle}>Зар тус бүрээр</Text>

      {stats.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Одоогоор зар байхгүй байна</Text>
        </View>
      ) : (
        stats.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            onPress={() => router.push({ pathname: '/job-detail', params: { id: job.id } })}
          >
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobCompany}>{job.company}</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{job.views}</Text>
                <Text style={styles.statLabel}>👁 Үзсэн</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{job.chats}</Text>
                <Text style={styles.statLabel}>💬 Чат</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{job.saves}</Text>
                <Text style={styles.statLabel}>❤️ Хадгалсан</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backText: { fontSize: 16, color: '#6C63FF', fontWeight: '600' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  totalRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, marginBottom: 20 },
  totalBox: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  totalBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f0f0f0' },
  totalNum: { fontSize: 26, fontWeight: 'bold', color: '#6C63FF' },
  totalLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  emptyBox: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 15, color: '#888' },
  jobCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, elevation: 2 },
  jobTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  jobCompany: { fontSize: 13, color: '#888', marginBottom: 12 },
  statRow: { flexDirection: 'row', gap: 10 },
  statItem: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10, padding: 10, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#6C63FF' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
});