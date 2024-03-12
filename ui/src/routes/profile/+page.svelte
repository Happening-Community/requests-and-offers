<script lang="ts">
  import CreateProfileBtn from '$lib/CreateProfileBtn.svelte';
  import { myProfile, profiles, getAllProfiles, myProfileHash } from '@stores/profiles.store';
  import { Avatar } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import type { PageData } from '../$types';

  export let data: PageData;

  let profilePictureUrl: string;

  onMount(async () => {
    if ($profiles.length === 0) await getAllProfiles();
  });

  // $: console.log('myProfileHash :', $myProfileHash?.toString());
  // $: console.log('data.hash :', data.hash);
  // $: console.log($myProfileHash?.toString() === data.hash);

  $: profile = data.id ? $profiles[data.id] : $myProfile;

  $: {
    profilePictureUrl = profile?.profile_picture
      ? URL.createObjectURL(new Blob([new Uint8Array(profile.profile_picture)]))
      : '/default_avatar.webp';
  }
</script>

<section class="flex flex-col items-center">
  {#if !profile}
    <CreateProfileBtn />
  {:else}
    <div class="mb-10 flex flex-col items-center gap-5">
      <h2 class="h2">
        Welcome <span class="text-primary-500 font-bold">{profile.name}</span> !
      </h2>
      {#if !data.id}
        <a href="/profile/edit" class="btn variant-filled-primary w-fit text-white">Edit profile</a>
      {/if}
    </div>
    <div
      class="border-surface-600 bg-surface-400 flex w-1/2 min-w-96 flex-col items-center gap-5 rounded-xl border-8 p-5 drop-shadow-xl"
    >
      <h3 class="h3"><b>Nickname :</b> {profile.nickname}</h3>
      <div class="drop-shadow-lg" on:load={() => URL.revokeObjectURL(profilePictureUrl)}>
        <Avatar src={profilePictureUrl} width="w-64" />
      </div>
      <p class="text-center">{profile.bio}</p>
      <p><b>Type :</b> {profile.user_type}</p>
      <p><b>Skills :</b> {profile.skills?.join(', ')}</p>
      <p><b>Email :</b> {profile.email}</p>
      <p><b>Phone number :</b> {profile.phone}</p>
      <p><b>Timezone :</b> {profile.time_zone}</p>
      <p><b>Location :</b> {profile.location}</p>
    </div>
  {/if}
</section>
