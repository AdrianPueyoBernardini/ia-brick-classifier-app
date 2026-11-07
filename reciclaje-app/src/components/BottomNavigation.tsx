
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname, router } from 'expo-router';

const COLORS = {
  primary: '#356B50',
  inactive: '#858D84',
  background: '#FFFFFF',
  border: '#E4E8DF',
};

export default function BottomNavigation() {
  const pathname = usePathname();

  const isCamera = pathname === '/';
  const isPhotos = pathname === '/fotos';

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.tab}
        onPress={() => router.navigate('/')}
      >
        <Text style={[
          styles.icon,
          isCamera && styles.active
        ]}>
          📷
        </Text>
        <Text style={[
          styles.label,
          isCamera && styles.active
        ]}>
          Cámara
        </Text>
      </Pressable>

      <Pressable
        style={styles.tab}
        onPress={() => router.navigate('/fotos')}
      >
        <Text style={[
          styles.icon,
          isPhotos && styles.active
        ]}>
          🖼️
        </Text>
        <Text style={[
          styles.label,
          isPhotos && styles.active
        ]}>
          Mis fotos
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 22,
    color: COLORS.inactive,
  },
  label: {
    fontSize: 12,
    color: COLORS.inactive,
  },
  active: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
