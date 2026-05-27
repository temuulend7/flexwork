import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [lang, setLang] = useState(i18n.language);
  const { t } = useTranslation();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || '');
      const { data } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();
      if (data) setRole(data.role);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Гарах', 'Гарахдаа итгэлтэй байна уу?', [
      { text: 'Үгүй', style: 'cancel' },
      {
        text: 'Тийм',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const menuItems = [
    { id: '1', icon: '📊', label: t('stats') },
    { id: '2', icon: '❤️', label: t('savedJobs') },
    { id: '3', icon: '🔔', label: t('notifications') },
    { id: '4', icon: '🔒', label: t('changePassword') },
    { id: '5', icon: '❓', label: t('help') },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t('profile')}</Text>

      {/* Хэл сонгох */}
      <View style={styles.langRow}>
        <TouchableOpacity
          style={[styles.langBtn, lang === 'mn' && styles.langBtnActive]}
          onPress={() => { i18n.changeLanguage('mn'); setLang('mn'); }}
        >
          <Text style={[styles.langText, lang === 'mn' && styles.langTextActive]}>🇲🇳 MN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
          onPress={() => { i18n.changeLanguage('en'); setLang('en'); }}
        >
          <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>🇺🇸 EN</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{email ? email[0].toUpperCase() : '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {role === 'employer' ? t('employer') : t('worker')}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/edit-profile')} style={styles.editBtn}>
          <Text style={styles.editBtnText}>✏️ Засах</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              if (item.id === '1') router.push('/stats');
              if (item.id === '2') router.push('/saved');
              if (item.id === '4') handleChangePassword();
            }}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuLabel, { color: 'red' }]}>{t('logout')}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a' },
  langRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  langBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  langBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  langText: { fontSize: 13, color: '#555' },
  langTextActive: { color: '#fff', fontWeight: '600' },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2, gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#888', marginBottom: 6 },
  badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  badgeText: { color: '#6C63FF', fontSize: 12, fontWeight: '600' },
  editBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editBtnText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  menu: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  menuArrow: { fontSize: 20, color: '#ccc' },
});