import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function ChangePasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Алдаа', 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой!');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Алдаа', 'Нууц үг таарахгүй байна!');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

   if (error) {
    if (error.message.includes('same password')) {
      Alert.alert('Алдаа', 'Шинэ нууц үг хуучин нууц үгтэй адил байна!');
    } else if (error.message.includes('weak')) {
      Alert.alert('Алдаа', 'Нууц үг хэтэрхий энгийн байна!');
    } else {
      Alert.alert('Алдаа', 'Нууц үг солиход алдаа гарлаа. Дахин оролдоно уу!');
    }
  } else {
    Alert.alert('Амжилттай!', 'Нууц үг амжилттай солигдлоо!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Буцах</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Нууц үг солих</Text>

      <Text style={styles.label}>Шинэ нууц үг</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Нууц үг давтах</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleChange} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Түр хүлээнэ үү...' : 'Нууц үг солих'}</Text>
      </TouchableOpacity>
    </View>
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