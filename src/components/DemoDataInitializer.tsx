'use client';

import { useEffect } from 'react';
import { seedDemoData } from '@/lib/storage';

export default function DemoDataInitializer() {
  useEffect(() => {
    // Automatically seed initial sample data if not already present
    seedDemoData(false);
  }, []);

  return null;
}
