import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { View, Text, Button } from 'react-native';

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <View>
      <Text>Welcome, {user?.primaryEmailAddress?.emailAddress}</Text>
      <Button title="Logout" onPress={async () => {
        await signOut();
        router.replace('/login');
      }} />
    </View>
  );
}
