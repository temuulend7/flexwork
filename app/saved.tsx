import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { router, useFocusEffect } from 'expo-router';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  time: string;
  pay: string;
  type: string;
};

export default function SavedScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [])
  );

  const fetchSaved = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('saved_jobs')
      .select('job_id, jobs(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const savedJobs = data.map((item: any) => item.jobs).filter(Boolean);
      setJobs(savedJobs);
    }
    setLoading(false);
  };

  const handleUnsave = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('saved_jobs')
      .delete()
      .eq('job_id', jobId)
      .eq('user_id', user.id);

    setJobs((prev) => prev.filter((j) => j.id !== jobId));
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Хадгалсан зарууд</Text>
      </View>

      {jobs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Хадгалсан зар байхгүй байна</Text>
          <Text style={styles.emptySub}>Зарын дэлгэрэнгүй дээр ❤️ дарж хадгалаарай</Text>
        </View>
      ) : (
        <ScrollView>
          {jobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/job-detail', params: { id: job.id } })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.title}>{job.title}</Text>
                <TouchableOpacity onPress={() => handleUnsave(job.id)}>
                  <Text style={styles.unsaveBtn}>❤️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.company}>{job.company} · {job.location}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.badge}>{job.type}</Text>
                <Text style={styles.info}>🕐 {job.time}</Text>
                <Text style={styles.info}>💵 {job.pay}</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  backText: { fontSize: 16, color: '#6C63FF', fontWeight: '600' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  empty: { fontSize: 16, fontWeight: '600', color: '#888', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  unsaveBtn: { fontSize: 20 },
  company: { fontSize: 12, color: '#888', marginBottom: 8 },
  cardBottom: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  badge: { backgroundColor: '#EEF2FF', color: '#6C63FF', fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  info: { fontSize: 12, color: '#555' },
});