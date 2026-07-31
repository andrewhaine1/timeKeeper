import { useEffect, useState } from 'react';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from './client';
import migrations from './migrations/migrations';
import { seedTaskStatuses } from './seed';

export function useLocalDb() {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!success) return;
    seedTaskStatuses().then(() => setSeeded(true));
  }, [success]);

  return { ready: success && seeded, error };
}
