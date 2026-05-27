import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  time: string;
  pay: string;
  type: string;
  created_at: string;
};

const TYPE_KEYS = [
  { key: 'all', db: '' },
  { key: 'halfDay', db: 'Хагас өдөр' },
  { key: 'oneHour', db: '1 цагийн' },
  { key: 'weekend', db: 'Амралтын өдөр' },
  { key: 'fullDay', db: 'Бүтэн өдөр' },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  useEffect(() => {
    filterJobs();
  }, [search, activeType, jobs]);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
    setRefreshing(false);
  };

  const filterJobs = () => {
    let result = [...jobs];
    const found = TYPE_KEYS.find((t) => t.key === activeType);
    if (found && found.db) {
      result = result.filter((j) => j.type === found.db);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(s) ||
          j.company.toLowerCase().includes(s) ||
          j.location.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{t('jobs')}</Text>
        <TouchableOpacity style={styles.mapBtn} onPress={() => router.push('/map')}>
          <Text style={styles.mapBtnText}>{t('map')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
      >
        {TYPE_KEYS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, activeType === item.key && styles.chipActive]}
            onPress={() => setActiveType(item.key)}
          >
            <Text style={[styles.chipText, activeType === item.key && styles.chipTextActive]}>
              {t(item.key)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{t('resultsCount', { count: filtered.length })}</Text>

      {filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{t('noJobs')}</Text>
          <Text style={styles.emptySub}>{t('noJobsSub')}</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/job-detail', params: { id: job.id } })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.title}>{job.title}</Text>
                <Text style={styles.badge}>{job.type}</Text>
              </View>
              <Text style={styles.company}>{job.company} · {job.location}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.info}>🕐 {job.time}</Text>
                <Text style={styles.info}>💵 {job.pay}</Text>
                <Text style={styles.info}>📅 {new Date(job.created_at).toLocaleDateString('mn-MN')}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  mapBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  mapBtnText: { fontSize: 12, color: '#6C63FF', fontWeight: '600' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, elevation: 1 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  clearBtn: { fontSize: 14, color: '#aaa', paddingLeft: 8 },
  filterRow: { marginBottom: 12, maxHeight: 40 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', height: 34, justifyContent: 'center' },
  chipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  chipText: { fontSize: 11, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  resultCount: { fontSize: 12, color: '#888', marginBottom: 10 },
  empty: { fontSize: 16, fontWeight: '600', color: '#888', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#aaa' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '500', color: '#1a1a1a' },
  badge: { backgroundColor: '#EEF2FF', color: '#6C63FF', fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  company: { fontSize: 12, color: '#888', marginBottom: 8 },
  cardBottom: { flexDirection: 'row', gap: 12 },
  info: { fontSize: 12, color: '#555' },
});