import { get, writable, type Writable } from 'svelte/store';

export type Profile = {
	name: string;
	nickname: string;
	bio?: string;
	profile_picture?: Uint8Array;
	individual_type: 'developer' | 'advocate';
	skills?: string[];
	email: string;
	phone?: string;
	time_zone?: string;
	location?: string;
	created_at?: number;
};

export const myProfile: Writable<Profile | null> = writable();

export async function getMyProfile() {
	return get(myProfile);
}

export async function createProfile(profile: Profile) {
	myProfile.set(profile);
}

export async function updateProfile(profile: Profile) {
	myProfile.update(() => profile);
}
