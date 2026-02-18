import { useState } from 'react';
import { UserProfile } from '../types/UserProfile';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  company: 'CirTag Industries',
  role: 'Sustainability Manager',
  avatarUrl: '',
};

export function useUserProfile() {
  const [profile] = useState<UserProfile>(DEFAULT_PROFILE);

  return { profile };
}
