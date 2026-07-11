import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '@/hooks/useSession';

export default function PrivateIndex() {
  const { activeEstablishment } = useSession();

  if (!activeEstablishment) {
    return <Redirect href="/(private)/establishments" />;
  }

  return <Redirect href="/(private)/dashboard" />;
}
