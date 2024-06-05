<script lang="ts">
  import { page } from '$app/stores';
  import { Avatar, getModalStore } from '@skeletonlabs/skeleton';
  import { updateProfileStatus } from '@stores/administrators.store';
  import { getLatestProfile, type Profile, type ProfileStatus } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  const modalStore = getModalStore();

  export let parent: any;

  let profile: Profile | null;
  let profilePictureUrl: string;

  onMount(async () => {
    profile = await getLatestProfile($modalStore[0].meta.hash);

    profilePictureUrl = profile?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
      : '/default_avatar.webp';
  });

  async function updateStatus(status: ProfileStatus) {
    const updatedProfile = await updateProfileStatus($modalStore[0].meta.hash, status);
  }
</script>

<article
  class="bg-surface-800 flex max-h-[90vh] w-3/5 flex-col items-center gap-4 overflow-auto p-10 text-white shadow-xl"
>
  {#if profile}
    <h2 class="h2 font-bold">{profile.name}</h2>
    <h3 class="h3"><b>Nickname :</b> {profile.nickname}</h3>
    <div on:load={() => URL.revokeObjectURL(profilePictureUrl)}>
      <Avatar src={profilePictureUrl} width="w-64" background="none" />
    </div>
    <p class="text-center">{profile.bio}</p>
    <p><b>Type :</b> {profile.user_type}</p>
    <p><b>Skills :</b> {profile.skills?.join(', ')}</p>
    <p><b>Email :</b> {profile.email}</p>
    <p><b>Phone number :</b> {profile.phone}</p>
    <p><b>Timezone :</b> {profile.time_zone}</p>
    <p><b>Location :</b> {profile.location}</p>
  {/if}
  <div class="mt-5 flex flex-col items-center gap-4">
    {#if $page.url.pathname === '/admin/persons'}
      <div class="space-x-4">
        <button
          class="btn variant-filled-tertiary"
          on:click={() => updateProfileStatus($modalStore[0].meta.hash, 'accepted')}
        >
          Accept
        </button>
        <button
          class="btn variant-filled-error"
          on:click={() => updateProfileStatus($modalStore[0].meta.hash, 'rejected')}
        >
          Reject
        </button>
      </div>
    {/if}
    <button class="btn variant-filled-secondary w-fit" on:click={() => modalStore.close()}>
      Close
    </button>
  </div>
</article>
