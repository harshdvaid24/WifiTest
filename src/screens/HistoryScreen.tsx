import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

interface SessionEntry {
  id: number;
  startTime: number;
  endTime: number;
  avgRSSI: number;
  presencePercent: number;
  dominantActivity: string;
}

export function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  useEffect(() => {
    // Placeholder: In production, load from react-native-quick-sqlite
    setSessions([
      {
        id: 1,
        startTime: Date.now() - 3600000,
        endTime: Date.now() - 1800000,
        avgRSSI: -52,
        presencePercent: 85,
        dominantActivity: 'sitting',
      },
      {
        id: 2,
        startTime: Date.now() - 7200000,
        endTime: Date.now() - 5400000,
        avgRSSI: -48,
        presencePercent: 92,
        dominantActivity: 'walking',
      },
    ]);
  }, []);

  const exportCSV = useCallback(async () => {
    try {
      const header = 'id,startTime,endTime,avgRSSI,presencePercent,dominantActivity\n';
      const rows = sessions
        .map(
          s =>
            `${s.id},${new Date(s.startTime).toISOString()},${new Date(s.endTime).toISOString()},${s.avgRSSI},${s.presencePercent},${s.dominantActivity}`,
        )
        .join('\n');
      const csv = header + rows;

      // In production: use react-native-share to share the CSV file
      Alert.alert('Export', `CSV generated with ${sessions.length} sessions`);
    } catch (e) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  }, [sessions]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const formatDuration = (start: number, end: number) => {
    const mins = Math.round((end - start) / 60000);
    return `${mins} min`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Session History</Text>
        <TouchableOpacity onPress={exportCSV}>
          <Text style={styles.exportBtn}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTime}>
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </Text>
              <Text style={styles.sessionDuration}>
                {formatDuration(item.startTime, item.endTime)}
              </Text>
            </View>
            <View style={styles.sessionStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.avgRSSI} dBm</Text>
                <Text style={styles.statLabel}>Avg RSSI</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.presencePercent}%</Text>
                <Text style={styles.statLabel}>Presence</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{item.dominantActivity}</Text>
                <Text style={styles.statLabel}>Activity</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sessions recorded yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  exportBtn: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  sessionDuration: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 48,
    fontSize: 14,
  },
});
