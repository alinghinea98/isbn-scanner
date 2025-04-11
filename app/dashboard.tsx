import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icon lib
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const handleScan = () => {
    router.push('/scan');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.welcomeText}>
        Welcome, {user?.primaryEmailAddress?.emailAddress}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleScan}>
        <Text style={styles.buttonText}>Scan ISBN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  logoutIcon: {
    position: 'absolute',
    top: 32,
    right: 32,
    zIndex: 1
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 32,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    width: '100%',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
