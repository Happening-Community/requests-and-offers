import type { Actions } from '@sveltejs/kit';
import { createProfile, type Profile } from '$lib/stores/profiles';

export const actions: Actions = {
	default: async ({ request }) => {
		const data: FormData = await request.formData();
		const name = data.get('name') as string;
		const nickname = data.get('nickname') as string;
		const bio = data.get('bio') as string;
		const profile_picture = data.get('picture') as string;
		const individual_type = data.get('individual_type') as 'developer' | 'advocate';
		const skills = data.getAll('skills') as string[];
		const email = data.get('email') as string;
		const phone = data.get('phone') as string;
		const time_zone = data.get('timezone') as string;
		const location = data.get('location') as string;

		// console.log(profile_picture);

		const profile: Profile = {
			name,
			nickname,
			bio,
			profile_picture: new Uint8Array(),
			individual_type,
			skills,
			email,
			phone,
			time_zone,
			location
		};

		let success = true;

		try {
			await createProfile(profile);
		} catch (e) {
			console.error(e);
			success = false;
		}

		return { success };
	}
};
