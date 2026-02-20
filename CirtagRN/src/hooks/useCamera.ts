import { useState, useEffect } from 'react';
import { useCameraPermissions } from 'expo-camera';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();

  return {
    hasPermission: permission?.granted ?? false,
    canAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
  };
}
