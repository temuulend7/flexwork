import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  time: string;
  pay: string;
  type: string;
  description: string;
  employer_id: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  reviewer_id: string;
  created_at: string;
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const recordView = async (jobId: string, userId: string) => {
    const { data: existing } = await supabase
      .from('job_views')
      .select('id')
      .eq('job_id', jobId)
      .eq('viewer_id', userId)
      .single();

    if (!existing) {
      await supabase.from('job_views').insert({
        job_id: jobId,
        viewer_id: userId,
      });
    }
  };

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    const { data: jobData } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    if (jobData) setJob(jobData);

    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*')
      .eq('job_id', id)
      .order('created_at', { ascending: false });
    if (reviewData) {
      setReviews(reviewData);
      if (user) {
        setHasReviewed(reviewData.some((r) => r.reviewer_id === user.id));
      }
    }

    if (user) {
      const { data: savedData } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('job_id', id)
        .eq('user_id', user.id)
        .single();
      setSaved(!!savedData);
    }

    if (user && jobData && user.id !== jobData.employer_id) {
      recordView(String(id), user.id);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSavingJob(true);
    if (saved) {
      await supabase.from('saved_jobs').delete().eq('job_id', id).eq('user_id', currentUserId);
      setSaved(false);
    } else {
      await supabase.from('saved_jobs').insert({ job_id: id, user_id: currentUserId });
      setSaved(true);
    }
    setSavingJob(false);
  };

  const handleChat = async () => {
    if (!job) return;
    if (currentUserId === job.employer_id) {
      Alert.alert('Анхааруулга', 'Өөрийн зартай чатлах боломжгүй!');
      return;
    }
    router.push({
      pathname: '/chat-room',
      params: { receiverId: job.employer_id, jobId: job.id, jobTitle: job.title },
    });
  };

  const handleReview = async () => {
    if (rating === 0) { Alert.alert('Анхааруулга', 'Одоо сонгоно уу!'); return; }
    if (!job) return;
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      job_id: job.id, reviewer_id: currentUserId,
      employer_id: job.employer_id, rating, comment,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Алдаа', error.message);
    } else {
      Alert.alert('Амжилттай!', 'Үнэлгээ илгээгдлээ! ⭐');
      setHasReviewed(true); setRating(0); setComment('');
      fetchAll();
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#6C63FF" /></View>;
  if (!job) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} disabled={savingJob}>
          <Text style={styles.saveBtn}>{saved ? '❤️ Хадгалсан' : '🤍 Хадгалах'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.card}>
          <Text style={styles.badge}>{job.type}</Text>
          <Text style={styles.title}>{job.title}</Text>

          <TouchableOpacity
            style={styles.companyBtn}
            onPress={() => router.push({ pathname: '/user-profile', params: { userId: job.employer_id } })}
          >
            <Text style={styles.companyBtnText}>🏢 {job.company}</Text>
            <Text style={styles.companyBtnArrow}>Профайл харах →</Text>
          </TouchableOpacity>

          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{job.location}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoText}>{job.time}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💵</Text>
              <Text style={styles.infoText}>{job.pay}</Text>
            </View>
          </View>

          {job.description && (
            <>
              <Text style={styles.sectionTitle}>Тодорхойлолт</Text>
              <Text style={styles.description}>{job.description}</Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Үнэлгээ & Шүүмж</Text>
            {avgRating && (
              <View style={styles.avgBox}>
                <Text style={styles.avgStar}>⭐</Text>
                <Text style={styles.avgText}>{avgRating}</Text>
                <Text style={styles.avgCount}>({reviews.length})</Text>
              </View>
            )}
          </View>

          {currentUserId !== job.employer_id && !hasReviewed && (
            <View style={styles.writeReview}>
              <Text style={styles.label}>Үнэлгээ өгөх:</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <Text style={styles.star}>{s <= rating ? '⭐' : '☆'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Сэтгэгдэл бичих... (заавал биш)"
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity style={styles.reviewBtn} onPress={handleReview} disabled={submitting}>
                <Text style={styles.reviewBtnText}>{submitting ? 'Илгээж байна...' : 'Үнэлгээ илгээх'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasReviewed && <Text style={styles.alreadyReviewed}>✅ Та үнэлгээ өгсөн байна</Text>}

          {reviews.length === 0 ? (
            <Text style={styles.noReview}>Одоогоор үнэлгээ байхгүй байна</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewItem}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewStars}>{'⭐'.repeat(r.rating)}</Text>
                  <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString('mn-MN')}</Text>
                </View>
                {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
              </View>
            ))
          )}
        </View>

        {currentUserId !== job.employer_id && (
          <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
            <Text style={styles.chatBtnText}>💬 Ажил олгогчтой чатлах</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backText: { fontSize: 16, color: '#6C63FF', fontWeight: '600' },
  saveBtn: { fontSize: 14, color: '#6C63FF', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, marginBottom: 12 },
  badge: { backgroundColor: '#EEF2FF', color: '#6C63FF', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  companyBtn: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1.5, borderColor: '#6C63FF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyBtnText: { fontSize: 15, fontWeight: '600', color: '#6C63FF' },
  companyBtnArrow: { fontSize: 14, color: '#6C63FF', fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  infoBox: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10, padding: 10, alignItems: 'center' },
  infoIcon: { fontSize: 20, marginBottom: 4 },
  infoText: { fontSize: 12, color: '#555', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  description: { fontSize: 14, color: '#555', lineHeight: 22 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  avgBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avgStar: { fontSize: 16 },
  avgText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  avgCount: { fontSize: 12, color: '#888' },
  writeReview: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  star: { fontSize: 28 },
  commentInput: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 10, minHeight: 80, textAlignVertical: 'top' },
  reviewBtn: { backgroundColor: '#6C63FF', borderRadius: 10, padding: 12, alignItems: 'center' },
  reviewBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  alreadyReviewed: { fontSize: 14, color: '#6C63FF', marginBottom: 12 },
  noReview: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 10 },
  reviewItem: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginTop: 8 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewStars: { fontSize: 14 },
  reviewDate: { fontSize: 11, color: '#aaa' },
  reviewComment: { fontSize: 13, color: '#555', lineHeight: 20 },
  chatBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center' },
  chatBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});