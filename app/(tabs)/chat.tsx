import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

type ChatItem = {
  job_id: string;
  job_title: string;
  other_user_email: string;
  other_user_id: string;
  last_message: string;
  last_time: string;
};

export default function ChatScreen() {
  const { t } = useTranslation();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  const loadChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: messages } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, job_id, content, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!messages) { setLoading(false); setRefreshing(false); return; }

    const seen = new Set();
    const uniqueChats: any[] = [];

    for (const msg of messages) {
      const key = `${msg.job_id}-${msg.sender_id === user.id ? msg.receiver_id : msg.sender_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueChats.push(msg);
      }
    }

    const chatItems: ChatItem[] = await Promise.all(
      uniqueChats.map(async (msg) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', otherId)
          .single();

        const { data: job } = await supabase
          .from('jobs')
          .select('title')
          .eq('id', msg.job_id)
          .single();

        const date = new Date(msg.created_at);
        const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

        return {
          job_id: msg.job_id,
          job_title: job?.title || 'Ажлын зар',
          other_user_email: profile?.email || 'Хэрэглэгч',
          other_user_id: otherId,
          last_message: msg.content,
          last_time: time,
        };
      })
    );

    setChats(chatItems);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
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
      <Text style={styles.header}>{t('chat')}</Text>
      {chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{t('noChat')}</Text>
          <Text style={styles.emptySub}>{t('noChatSub')}</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />
          }
        >
          {chats.map((chat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push({
                pathname: '/chat-room',
                params: {
                  receiverId: chat.other_user_id,
                  jobId: chat.job_id,
                  jobTitle: chat.job_title,
                },
              })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {chat.other_user_email[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.name}>{chat.other_user_email}</Text>
                  <Text style={styles.time}>{chat.last_time}</Text>
                </View>
                <Text style={styles.jobTitle}>{chat.job_title}</Text>
                <Text style={styles.lastMsg} numberOfLines={1}>{chat.last_message}</Text>
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
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  empty: { fontSize: 16, fontWeight: '600', color: '#888', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 2, alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  time: { fontSize: 11, color: '#aaa' },
  jobTitle: { fontSize: 12, color: '#6C63FF', marginTop: 2 },
  lastMsg: { fontSize: 13, color: '#888', marginTop: 2 },
});