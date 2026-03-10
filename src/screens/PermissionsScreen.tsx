import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';

interface Props {
  onComplete: () => void;
}

export function PermissionsScreen({onComplete}: Props) {
  const [locationGranted, setLocationGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  const requestLocation = async () => {
    if (Platform.OS !== 'android') return;
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'WiFi Sense needs location access to scan WiFi networks. This is an Android requirement for WiFi scanning — we never track your location.',
        buttonPositive: 'Allow',
      },
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      setLocationGranted(true);
    } else {
      Alert.alert(
        'Permission Required',
        'WiFi scanning requires location permission on Android.',
      );
    }
  };

  const requestNotification = async () => {
    if (Platform.OS !== 'android' || Platform.Version < 33) {
      setNotifGranted(true);
      return;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification Permission',
        message:
          'Allow notifications to show scanning status when the app runs in the background.',
        buttonPositive: 'Allow',
      },
    );
    setNotifGranted(result === PermissionsAndroid.RESULTS.GRANTED);
  };

  const allGranted = locationGranted && notifGranted;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions</Text>
      <Text style={styles.subtitle}>
        WiFi Sense needs these permissions to work correctly
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>{'\u{1F4CD}'}</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Location Access</Text>
          <Text style={styles.cardDesc}>
            Required by Android to scan WiFi networks. We never track your
            actual location.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.grantBtn, locationGranted && styles.grantedBtn]}
          onPress={requestLocation}
          disabled={locationGranted}>
          <Text
            style={[
              styles.grantText,
              locationGranted && styles.grantedText,
            ]}>
            {locationGranted ? 'Granted' : 'Allow'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardIcon}>{'\u{1F514}'}</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <Text style={styles.cardDesc}>
            Shows scanning status when running in the background.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.grantBtn, notifGranted && styles.grantedBtn]}
          onPress={requestNotification}
          disabled={notifGranted}>
          <Text
            style={[styles.grantText, notifGranted && styles.grantedText]}>
            {notifGranted ? 'Granted' : 'Allow'}
          </Text>
        </TouchableOpacity>
      </View>

      {allGranted && (
        <TouchableOpacity style={styles.continueBtn} onPress={onComplete}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  cardDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  grantBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  grantedBtn: {
    backgroundColor: '#E8F5E9',
  },
  grantText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  grantedText: {
    color: '#4CAF50',
  },
  continueBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 24,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
