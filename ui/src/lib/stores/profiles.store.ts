import { decodeRecords } from '$lib/utils';
import hc from '@services/client.service';
import { get, writable, type Writable } from 'svelte/store';

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
  created_at: number;
};

export const myProfile: Writable<Profile | null> = writable(null);
export const profiles: Writable<Profile[]> = writable([]);

export async function getMyProfileZomeCall() {
  const myProfileRecord = await hc.callZome('profiles', 'get_my_profile', null);
  if (myProfileRecord) {
    myProfile.set(decodeRecords([myProfileRecord])[0]);
  }
}

export async function getAllProfilesZomeCall() {
  profiles.set(decodeRecords(await hc.callZome('profiles', 'get_all_profiles', null)));
}

export async function createProfile(profile: Profile) {
  await hc.callZome('profiles', 'create_profile', profile);
}
