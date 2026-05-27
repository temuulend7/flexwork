import { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useFocusEffect, router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  time: string;
  pay: string;
  type: string;
};

export default function PostScreen() {
  const { t } = useTranslation();
  const [role, setRole] = useState('');
  const [tab, setTab] = useState<'add' | 'my'>('add');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [pay, setPay] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const types = [t('halfDay'), t('oneHour'), t('weekend'), t('fullDay')];

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileData) setRole(profileData.role);

        setJobsLoading(true);
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('employer_id', user.id)
          .order('created_at', { ascending: false });

        if (jobsData) setMyJobs(jobsData);
        setJobsLoading(false);
      };

      load();
    }, [])
  );

  const handlePost = async () => {
    if (!title || !company || !location || !pay || !time || !type) {
      Alert.alert('Анхааруулга', 'Бүх талбарыг бөглөнө үү!');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const typeMap: Record<string, string> = {
        [t('halfDay')]: 'Хагас өдөр',
        [t('oneHour')]: '1 цагийн',
        [t('weekend')]: 'Амралтын өдөр',
        [t('fullDay')]: 'Бүтэн өдөр',
      };
      const { error } = await supabase.from('jobs').insert({
        title, company, location, pay, time,
        type: typeMap[type] || type,
        employer_id: user?.id,
        latitude,
        longitude,
      });
      if (error) {
        Alert.alert('Алдаа', error.message);
      } else {
        Alert.alert('Амжилттай!', t('postSuccess'));
        setTitle(''); setCompany(''); setLocation('');
        setPay(''); setTime(''); setType('');
        setLatitude(null); setLongitude(null);

        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('employer_id', user?.id)
          .order('created_at', { ascending: false });
        if (jobsData) setMyJobs(jobsData);
        setTab('my');
      }
    } catch {
      Alert.alert('Алдаа', 'Алдаа гарлаа!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (jobId: string, jobTitle: string) => {
    Alert.alert(
      'Зар устгах',
      `"${jobTitle}" зарыг устгахдаа итгэлтэй байна уу?`,
      [
        { text: 'Үгүй', style: 'cancel' },
        {
          text: 'Устгах',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('jobs').delete().eq('id', jobId);
            setMyJobs((prev) => prev.filter((j) => j.id !== jobId));
          },
        },
      ]
    );
  };

  const handleEdit = (job: Job) => {
    router.push({ pathname: '/edit-job', params: { id: job.id } });
  };

  if (role === 'worker') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{t('jobs')}</Text>
        <View style={styles.workerBox}>
          <Text style={styles.workerIcon}>👷</Text>
          <Text style={styles.workerTitle}>Та ажил хайгч байна</Text>
          <Text style={styles.workerSub}>Зар нэмэх боломж зөвхөн ажил олгогчдод байна.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('manageJobs')}</Text>

      <Modal visible={showMap} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 47.9077,
              longitude: 106.8832,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={(e) => {
              setLatitude(e.nativeEvent.coordinate.latitude);
              setLongitude(e.nativeEvent.coordinate.longitude);
            }}
          >
            {latitude && longitude && (
              <Marker coordinate={{ latitude, longitude }} />
            )}
          </MapView>
          <View style={styles.mapModalBottom}>
            <Text style={styles.mapCoordText}>
              {latitude ? `📍 ${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : 'Map дээр дарж байршил сонгоно уу'}
            </Text>
            <TouchableOpacity style={styles.mapConfirmBtn} onPress={() => setShowMap(false)}>
              <Text style={styles.mapConfirmText}>✅ Байршил баталгаажуулах</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'add' && styles.tabBtnActive]}
          onPress={() => setTab('add')}
        >
          <Text style={[styles.tabText, tab === 'add' && styles.tabTextActive]}>{t('addJob')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'my' && styles.tabBtnActive]}
          onPress={() => setTab('my')}
        >
          <Text style={[styles.tabText, tab === 'my' && styles.tabTextActive]}>{t('myJobs')} ({myJobs.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'add' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>{t('jobName')}</Text>
          <TextInput style={styles.input} placeholder="Жн: Кассир, Нярав..." value={title} onChangeText={setTitle} />

          <Text style={styles.label}>{t('company')}</Text>
          <TextInput style={styles.input} placeholder="Компанийн нэр" value={company} onChangeText={setCompany} />

          <Text style={styles.label}>{t('location')}</Text>
          <TextInput style={styles.input} placeholder="Дүүрэг, хороо..." value={location} onChangeText={setLocation} />

          <Text style={styles.label}>{t('salary')}</Text>
          <TextInput style={styles.input} placeholder="Жн: 30,000₮/өдөр" value={pay} onChangeText={setPay} />

          <Text style={styles.label}>{t('schedule')}</Text>
          <TextInput style={styles.input} placeholder="Жн: 09:00–14:00" value={time} onChangeText={setTime} />

          <Text style={styles.label}>{t('jobType')}</Text>
          <View style={styles.types}>
            {types.map((t_) => (
              <TouchableOpacity
                key={t_}
                style={[styles.typeBtn, type === t_ && styles.typeBtnActive]}
                onPress={() => setType(t_)}
              >
                <Text style={[styles.typeText, type === t_ && styles.typeTextActive]}>{t_}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t('mapLocation')}</Text>
          <TouchableOpacity style={styles.mapPickerBtn} onPress={() => setShowMap(true)}>
            <Text style={styles.mapPickerText}>
              {latitude ? `📍 ${latitude.toFixed(4)}, ${longitude?.toFixed(4)}` : '🗺️ Map дээр байршил сонгох (заавал биш)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handlePost} disabled={loading}>
            <Text style={styles.submitText}>{loading ? t('posting') : t('postJob')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {jobsLoading ? (
            <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} />
          ) : myJobs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Одоогоор зар байхгүй байна</Text>
              <TouchableOpacity onPress={() => setTab('add')}>
                <Text style={styles.emptyLink}>Зар нэмэх →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            myJobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
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
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(job)}>
                    <Text style={styles.editBtnText}>✏️ Засах</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(job.id, job.title)}>
                    <Text style={styles.deleteBtnText}>🗑️ Устгах</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  tabBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  tabText: { fontSize: 13, color: '#555', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  workerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 16, marginTop: 20 },
  workerIcon: { fontSize: 48, marginBottom: 16 },
  workerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  workerSub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14, elevation: 1 },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  typeBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  typeText: { fontSize: 13, color: '#555' },
  typeTextActive: { color: '#fff', fontWeight: '600' },
  submitBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  mapPickerBtn: { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#6C63FF' },
  mapPickerText: { color: '#6C63FF', fontSize: 14, fontWeight: '600' },
  mapModalBottom: { padding: 16, backgroundColor: '#fff', gap: 10 },
  mapCoordText: { fontSize: 13, color: '#555', textAlign: 'center' },
  mapConfirmBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center' },
  mapConfirmText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888', marginBottom: 8 },
  emptyLink: { fontSize: 14, color: '#6C63FF', fontWeight: '600' },
  jobCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  jobCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  jobTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  jobCompany: { fontSize: 12, color: '#888' },
  jobBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  jobBadgeText: { color: '#6C63FF', fontSize: 11 },
  jobCardBottom: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  jobInfo: { fontSize: 12, color: '#555' },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 1, backgroundColor: '#EEF2FF', borderRadius: 10, padding: 10, alignItems: 'center' },
  editBtnText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  deleteBtn: { flex: 1, backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, alignItems: 'center' },
  deleteBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
});