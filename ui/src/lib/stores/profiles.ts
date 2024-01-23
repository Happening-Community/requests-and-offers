import { get, type Writable } from 'svelte/store';
import { localStorageStore } from '@skeletonlabs/skeleton';

export type IndividualType = 'developer' | 'advocate';

export type Profile = {
  name: string;
  nickname: string;
  bio?: string;
  profile_picture?: Uint8Array;
  individual_type: IndividualType;
  skills?: string[];
  email: string;
  phone?: string;
  time_zone?: string;
  location?: string;
  created_at?: number;
};

export const myProfile: Writable<Profile | null> = localStorageStore('my-profile', null);

export function getMyProfile() {
  return get(myProfile);
}

export function createProfile(profile: Profile) {
  myProfile.set(profile);
}

export function updateProfile(profile: Profile) {
  myProfile.update(() => profile);
}
