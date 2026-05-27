import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function EditJobScreen() {
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [pay, setPay] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const types = ['Хагас өдөр', '1 цагийн', 'Амралтын өдөр', 'Бүтэн өдөр'];

  useEffect(() => {
    fetchJob();
  }, []);

  const fetchJob = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setTitle(data.title);
      setCompany(data.company);
      setLocation(data.location);
      setPay(data.pay);
      setTime(data.time);
      setType(data.type);
    }
    setFetching(false);
  };

  const handleSave = async () => {
    if (!title || !company || !location || !pay || !time || !type) {
      Alert.alert('Анхааруулга', 'Бүх талбарыг бөглөнө үү!');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('jobs')
      .update({ title, company, location, pay, time, type })
      .eq('id', id);

    setLoading(false);

    if (error) {
      Alert.alert('Алдаа', error.message);
    } else {
      Alert.alert('Амжилттай!', 'Зар шинэчлэгдлээ!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Буцах</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Зар засах</Text>

      <Text style={styles.label}>Ажлын нэр</Text>
      <TextInput style={styles.input} placeholder="Жн: Кассир, Нярав..." value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Компани / Байгууллага</Text>
      <TextInput style={styles.input} placeholder="Компанийн нэр" value={company} onChangeText={setCompany} />

      <Text style={styles.label}>Байршил</Text>
      <TextInput style={styles.input} placeholder="Дүүрэг, хороо..." value={location} onChangeText={setLocation} />

      <Text style={styles.label}>Цалин</Text>
      <TextInput style={styles.input} placeholder="Жн: 30,000₮/өдөр" value={pay} onChangeText={setPay} />

      <Text style={styles.label}>Цагийн хуваарь</Text>
      <TextInput style={styles.input} placeholder="Жн: 09:00–14:00" value={time} onChangeText={setTime} />

      <Text style={styles.label}>Ажлын төрөл</Text>
      <View style={styles.types}>
        {types.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, type === t && styles.typeBtnActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveBtnText}>{loading ? 'Хадгалж байна...' : 'Хадгалах'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 16, color: '#6C63FF', fontWeight: '600', marginBottom: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1a1a1a' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14, elevation: 1 },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  typeBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  typeText: { fontSize: 13, color: '#555' },
  typeTextActive: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});