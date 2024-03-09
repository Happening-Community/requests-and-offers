import { decodeRecords } from '@utils';
import hc from '@services/client.service';
import { writable, type Writable } from 'svelte/store';

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

/**
 * Svelte writable store for the current user's profile.
 * @type {Writable<Profile | null>}
 */
export const myProfile: Writable<Profile | null> = writable(null);

/**
 * Svelte writable store for all profiles.
 * @type {Writable<Profile[]>}
 */
export const profiles: Writable<Profile[]> = writable([]);

/**
 * Fetches the current user's profile from the 'profiles' zome and updates the `myProfile` store.
 * @async
 */
export async function getMyProfileZomeCall() {
  const myProfileRecord = await hc.callZome('profiles', 'get_my_profile', null);
  if (myProfileRecord) {
    myProfile.set(decodeRecords([myProfileRecord])[0]);
  }
}

/**
 * Fetches all profiles from the 'profiles' zome and updates the `profiles` store.
 * @async
 */
export async function getAllProfilesZomeCall() {
  profiles.set(decodeRecords(await hc.callZome('profiles', 'get_all_profiles', null)));
}

/**
 * Creates a new profile in the 'profiles' zome.
 * @async
 * @param {Profile} profile - The profile to be created.
 */
export async function createProfile(profile: Profile) {
  await hc.callZome('profiles', 'create_profile', profile);
}
