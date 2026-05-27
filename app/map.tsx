import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  pay: string;
  type: string;
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('id, title, company, location, pay, type, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    setJobs((data ?? [])as Job[]);
    setLoading(false);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Газрын зураг</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 47.9077,
          longitude: 106.8832,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {jobs.map((job) => (
          <Marker
            key={job.id}
            coordinate={{ latitude: job.latitude, longitude: job.longitude }}
            pinColor="#6C63FF"
          >
            <Callout onPress={() => router.push({ pathname: '/job-detail', params: { id: job.id } })}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{job.title}</Text>
                <Text style={styles.calloutCompany}>{job.company}</Text>
                <Text style={styles.calloutPay}>{job.pay}</Text>
                <Text style={styles.calloutType}>{job.type}</Text>
                <Text style={styles.calloutLink}>Дэлгэрэнгүй харах →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {jobs.length === 0 && (
        <View style={styles.noJobs}>
          <Text style={styles.noJobsText}>Байршилтай зар байхгүй байна</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, paddingTop: 60, backgroundColor: '#fff', elevation: 2 },
  backText: { fontSize: 16, color: '#6C63FF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  map: { flex: 1 },
  callout: { width: 200, padding: 8 },
  calloutTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
  calloutCompany: { fontSize: 13, color: '#888', marginBottom: 4 },
  calloutPay: { fontSize: 13, color: '#6C63FF', fontWeight: '600' },
  calloutType: { fontSize: 12, color: '#555', marginBottom: 4 },
  calloutLink: { fontSize: 12, color: '#6C63FF', marginTop: 4 },
  noJobs: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 4, alignItems: 'center' },
  noJobsText: { fontSize: 14, color: '#888' },
});