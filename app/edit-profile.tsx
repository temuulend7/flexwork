import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single();

    if (data) {
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Алдаа', 'Мэдээлэл хадгалахад алдаа гарлаа!');
    } else {
      Alert.alert('Амжилттай!', 'Профайл шинэчлэгдлээ!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Буцах</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Профайл засах</Text>

      <Text style={styles.label}>Нэр</Text>
      <TextInput
        style={styles.input}
        placeholder="Таны нэр"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Утасны дугаар</Text>
      <TextInput
        style={styles.input}
        placeholder="99xxxxxx"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Хадгалж байна...' : 'Хадгалах'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 24, paddingTop: 60 },
  backText: { fontSize: 16, color: '#6C63FF', fontWeight: '600', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14 },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});