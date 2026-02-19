import { useState } from 'react';
import { UserProfile } from '../types/UserProfile';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  company: 'CirTag Industry',
  role: 'Sustainability',
  avatarUrl: '',
};

export function useUserProfile() {
  const [profile] = useState<UserProfile>(DEFAULT_PROFILE);

  return { profile };
}
