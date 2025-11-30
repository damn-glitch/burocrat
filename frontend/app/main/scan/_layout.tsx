import { Stack } from 'expo-router';
import React from 'react';
import { ScanProvider } from './scanContext';

export default function ScanLayout() {
  return (
    <ScanProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </ScanProvider>
  );
}
