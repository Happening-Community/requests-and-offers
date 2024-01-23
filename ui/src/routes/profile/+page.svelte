<script lang="ts">
	import CreateProfileBtn from '$lib/CreateProfileBtn.svelte';
	import { getMyProfile } from '$lib/stores/profiles';
	import { onDestroy, onMount } from 'svelte';
	import defaultAvatarUrl from '$lib/assets/default_avatar.webp';

	let profilePictureUrl: string;
	let myProfile = getMyProfile();

	onMount(() => {
		console.log(myProfile?.profile_picture);
		console.log(Object.keys(myProfile?.profile_picture).length);

		if (Object.keys(myProfile?.profile_picture).length) {
			let profilePictureBlob = new Blob([myProfile?.profile_picture!], { type: 'image/png' });
			profilePictureUrl = URL.createObjectURL(profilePictureBlob);
			console.log(profilePictureBlob);
		} else {
			profilePictureUrl = defaultAvatarUrl;
		}

		console.log(profilePictureUrl);
	});

	onDestroy(() => {
		if (profilePictureUrl) {
			URL.revokeObjectURL(profilePictureUrl);
		}
	});
</script>

<section class="flex flex-col items-center">
	{#if !myProfile}
		<CreateProfileBtn />
	{:else}
		<div class="flex flex-col gap-5 items-center">
			<h2 class="h2">{myProfile.name}</h2>
			<h3 class="h3">{myProfile.nickname}</h3>
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img
				class="rounded-full"
				width="300"
				src={profilePictureUrl}
				alt="Profile Picture"
				on:load={() => URL.revokeObjectURL(profilePictureUrl)}
			/>
			<p>Bio : {myProfile.bio}</p>
			<p>Type : {myProfile.individual_type}</p>
			<p>Skills : {myProfile.skills?.join(', ')}</p>
			<p>Email : {myProfile.email}</p>
			<p>Phone number : {myProfile.phone}</p>
			<p>Timezone : {myProfile.time_zone}</p>
			<p>Location : {myProfile.location}</p>
		</div>
	{/if}
</section>
