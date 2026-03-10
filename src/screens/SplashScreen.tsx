import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const {width} = Dimensions.get('window');

interface Props {
  onComplete: () => void;
}

const SLIDES = [
  {
    title: 'WiFi Sense',
    description: 'Detect room presence using WiFi signal analysis',
    icon: '\u{1F4E1}',
  },
  {
    title: 'No Camera Needed',
    description: 'Privacy-first sensing using your JioFiber router signals',
    icon: '\u{1F512}',
  },
  {
    title: 'Smart Detection',
    description:
      'Presence, motion, breathing, and activity — all from WiFi RSSI',
    icon: '\u{1F9E0}',
  },
];

export function SplashScreen({onComplete}: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const apiLevel = Platform.Version;

  if (typeof apiLevel === 'number' && apiLevel < 28) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>\u{26A0}\u{FE0F}</Text>
        <Text style={styles.errorText}>
          Android 9+ (API 28) is required. Your device is running API{' '}
          {apiLevel}.
        </Text>
      </View>
    );
  }

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentSlide && styles.activeDot]}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (isLast) {
            onComplete();
          } else {
            setCurrentSlide(currentSlide + 1);
          }
        }}>
        <Text style={styles.buttonText}>
          {isLast ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    backgroundColor: '#2196F3',
    width: 24,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
    marginBottom: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
});
