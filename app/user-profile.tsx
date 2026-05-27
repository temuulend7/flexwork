import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
};

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  time: string;
  pay: string;
  type: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (profileData) setProfile(profileData);

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
    if (jobsData) setJobs(jobsData);

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
    if (reviewsData) setReviews(reviewsData);

    setLoading(false);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!profile) return null;

  const displayName = profile.full_name || profile.email;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Профайл</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Hero card */}
      <View style={styles.heroCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {displayName[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.heroName}>{displayName}</Text>
        <Text style={styles.heroEmail}>{profile.email}</Text>
        {profile.phone && (
          <View style={styles.phoneRow}>
            <Text style={styles.phoneText}>📞 {profile.phone}</Text>
          </View>
        )}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {profile.role === 'employer' ? '🏢 Ажил олгогч' : '👷 Ажил хайгч'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Нийт зар</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statNum}>{avgRating || '—'}</Text>
          <Text style={styles.statLabel}>⭐ Дундаж</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{reviews.length}</Text>
          <Text style={styles.statLabel}>Шүүмж</Text>
        </View>
      </View>

      {/* Jobs */}
      {jobs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Нийтэлсэн зарууд</Text>
          {jobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push({ pathname: '/job-detail', params: { id: job.id } })}
            >
              <View style={styles.jobCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company} · {job.location}</Text>
                </View>
                <View style={styles.jobBadge}>
                  <Text style={styles.jobBadgeText}>{job.type}</Text>
                </View>
              </View>
              <View style={styles.jobCardBottom}>
                <Text style={styles.jobInfo}>🕐 {job.time}</Text>
                <Text style={styles.jobInfo}>💵 {job.pay}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Шүүмжүүд</Text>
          {reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewStars}>{'⭐'.repeat(r.rating)}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(r.created_at).toLocaleDateString('mn-MN')}
                </Text>
              </View>
              {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18, color: '#6C63FF', fontWeight: 'bold' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  heroCard: { backgroundColor: '#fff', alignItems: 'center', padding: 24, marginBottom: 12 },
  avatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4 },
  avatarLargeText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  heroName: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  heroEmail: { fontSize: 14, color: '#888', marginBottom: 8 },
  phoneRow: { backgroundColor: '#f5f5f5', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  phoneText: { fontSize: 13, color: '#555' },
  roleBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  roleBadgeText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2 },
  statBox: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f0f0f0' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#6C63FF' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  jobCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  jobCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  jobCompany: { fontSize: 12, color: '#888' },
  jobBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  jobBadgeText: { color: '#6C63FF', fontSize: 11 },
  jobCardBottom: { flexDirection: 'row', gap: 12 },
  jobInfo: { fontSize: 12, color: '#555' },
  reviewCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewStars: { fontSize: 14 },
  reviewDate: { fontSize: 11, color: '#aaa' },
  reviewComment: { fontSize: 13, color: '#555', lineHeight: 20 },
});