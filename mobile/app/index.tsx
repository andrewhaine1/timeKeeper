import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useAppMode } from '@/src/context/AppModeContext';

export default function Index() {
  const { user } = useAuth();
  const { mode, serverUrl } = useAppMode();

  if (mode === null) return <Redirect href="/mode-select" />;
  if (mode === 'individual') return <Redirect href="/tasks" />;

  // Team mode
  if (!serverUrl) return <Redirect href="/server-setup" />;
  if (!user) return <Redirect href="/login" />;
  return <Redirect href="/tasks" />;
}
