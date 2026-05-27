import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

export default function ChatRoomScreen() {
  const { receiverId, jobId, jobTitle } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    setup();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const setup = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    await fetchMessages(user.id);

    const channel = supabase
      .channel(`chat-${user.id}-${receiverId}-${jobId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `job_id=eq.${jobId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      });

    channel.subscribe();
    channelRef.current = channel;
  };

  const fetchMessages = async (userId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');

    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: receiverId,
      job_id: jobId,
      content: content,
    }).select().single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{jobTitle}</Text>
            <Text style={styles.headerSub}>Чат</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={{ padding: 16 }}
        >
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const date = new Date(msg.created_at);
            const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            return (
              <View key={msg.id} style={[styles.msgRow, isMe && styles.msgRowMe]}>
                <View style={[styles.bubble, isMe && styles.bubbleMe]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                    {msg.content}
                  </Text>
                  <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
                    {time}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Мессеж бичих..."
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#fff', padding: 16, paddingTop: 60, elevation: 2 },
  backText: { fontSize: 24, color: '#6C63FF' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: '#888' },
  messages: { flex: 1 },
  msgRow: { flexDirection: 'row', marginBottom: 10 },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: { backgroundColor: '#fff', borderRadius: 16, padding: 12, maxWidth: '75%', elevation: 1 },
  bubbleMe: { backgroundColor: '#6C63FF' },
  bubbleText: { fontSize: 14, color: '#1a1a1a' },
  bubbleTextMe: { color: '#fff' },
  timeText: { fontSize: 10, color: '#aaa', marginTop: 4, alignSelf: 'flex-end' },
  timeTextMe: { color: 'rgba(255,255,255,0.7)' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', gap: 10, elevation: 2 },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#fff', fontSize: 18 },
});