<script lang="ts">
  import { page } from '$app/stores';
  import type { ActionHash } from '@holochain/client';
  import { Avatar, getModalStore } from '@skeletonlabs/skeleton';
  import {
    administrators,
    getAllAdministrators,
    removeAdministrator,
    updateProfileStatus
  } from '@stores/administrators.store';
  import { getAllProfiles, type Profile, type ProfileStatus } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  const modalStore = getModalStore();

  export let parent: any;

  let profilePictureUrl: string;
  let profile: Profile = $modalStore[0].meta.profile;
  let isTheOnlyAdmin = $administrators.length === 1;

  onMount(async () => {
    profilePictureUrl = profile?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
      : '/default_avatar.webp';
  });

  async function updateStatus(status: ProfileStatus) {
    if (!profile) return;
    const confirmation = confirm(
      `Are you sure you want to ${status === 'accepted' ? 'accept' : 'reject'} this profile ?`
    );
    if (!confirmation) return;

    await updateProfileStatus(
      profile?.original_action_hash!,
      profile?.previous_action_hash!,
      status
    );
    await getAllProfiles();

    modalStore.close();
  }

  async function handleRemoveAdmin(original_action_hash: ActionHash) {
    const confirmation = confirm('Are you sure you want to remove this administrator ?');
    if (!confirmation) return;

    await removeAdministrator(original_action_hash);
    await getAllAdministrators();
    modalStore.close();
  }
</script>

<article
  class="bg-surface-800 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-center text-white shadow-xl md:w-4/5"
>
  {#if profile}
    <h2 class="h2 font-bold">{profile.name}</h2>
    <h3 class="h3"><b>Nickname :</b> {profile.nickname}</h3>
    <div on:load={() => URL.revokeObjectURL(profilePictureUrl)}>
      <Avatar src={profilePictureUrl} width="w-64" background="none" />
    </div>
    <p>{profile.bio}</p>
    <p><b>Type :</b> {profile.user_type}</p>
    {#if profile.skills?.length}
      <p><b>Skills :</b> {profile.skills?.join(', ')}</p>
    {/if}
    <p><b>Email :</b> {profile.email}</p>
    {#if profile.phone}
      <p><b>Phone number :</b> {profile.phone}</p>
    {/if}
    {#if profile.time_zone}
      <p><b>Timezone :</b> {profile.time_zone}</p>
    {/if}
    {#if profile.location}
      <p><b>Location :</b> {profile.location}</p>
    {/if}
    <div class="mt-5 flex flex-col items-center gap-4">
      {#if $page.url.pathname === '/admin/persons'}
        <div class="space-x-4">
          {#if profile?.status !== 'accepted'}
            <button class="btn variant-filled-tertiary" on:click={() => updateStatus('accepted')}>
              Accept
            </button>
          {/if}
          {#if profile?.status !== 'rejected'}
            <button class="btn variant-filled-error" on:click={() => updateStatus('rejected')}>
              Reject
            </button>
          {/if}
        </div>
      {/if}
      {#if $page.url.pathname === '/admin/administrators'}
        <div class="space-x-4">
          <button
            class="btn variant-filled-error"
            on:click={() =>
              profile.original_action_hash && handleRemoveAdmin(profile.original_action_hash)}
            disabled={isTheOnlyAdmin}
            title={isTheOnlyAdmin ? 'Can not remove last admin' : ''}
          >
            Remove Admin
          </button>
        </div>
      {/if}
      <button class="btn variant-filled-secondary w-fit" on:click={() => modalStore.close()}>
        Close
      </button>
    </div>
  {/if}
</article>
