import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'worker' | 'employer'>('worker');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)/');
      }
      setChecking(false);
    });
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)/');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            role,
            full_name: '',
          });
        }
        Alert.alert('Амжилттай!', 'Бүртгэл үүслээ. Нэвтэрнэ үү.');
        setIsLogin(true);
      }
    } catch (error: any) {
      Alert.alert('Алдаа', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Анхааруулга', 'И-мэйл хаягаа оруулна уу!');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email,{redirectTo: 'flexwork://reset-password',});
    if (error) {
      Alert.alert('Алдаа', error.message);
    } else {
      Alert.alert('Амжилттай!', 'И-мэйл рүү нууц үг сэргээх линк илгээгдлээ!');
    }
  };

  if (checking) return <View style={{ flex: 1, backgroundColor: '#6C63FF' }} />;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.logo}>FlexWork</Text>
        <Text style={styles.subtitle}>Хагас цагийн ажлын платформ</Text>

        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}</Text>

          {!isLogin && (
            <>
              <Text style={styles.label}>Би:</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'worker' && styles.roleBtnActive]}
                  onPress={() => setRole('worker')}
                >
                  <Text style={[styles.roleText, role === 'worker' && styles.roleTextActive]}>👷 Ажил хайгч</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'employer' && styles.roleBtnActive]}
                  onPress={() => setRole('employer')}
                >
                  <Text style={[styles.roleText, role === 'employer' && styles.roleTextActive]}>🏢 Ажил олгогч</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.label}>И-мэйл</Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Нууц үг</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleAuth} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Түр хүлээнэ үү...' : isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? 'Бүртгэлгүй юу? Бүртгүүлэх' : 'Бүртгэлтэй юу? Нэвтрэх'}
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity onPress={handleForgotPassword} style={{ marginTop: 10 }}>
              <Text style={[styles.switchText, { color: '#888' }]}>Нууц үг мартсан?</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C63FF', justifyContent: 'center', padding: 24, minHeight: '100%' },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#fff', textAlign: 'center', marginBottom: 32, opacity: 0.85 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  roleText: { fontSize: 13, color: '#555' },
  roleTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  switchText: { textAlign: 'center', color: '#6C63FF', fontSize: 14 },
});