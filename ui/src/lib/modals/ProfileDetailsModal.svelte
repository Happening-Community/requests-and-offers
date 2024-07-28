<script lang="ts">
  import { page } from '$app/stores';
  import type { ActionHash } from '@holochain/client';
  import { Avatar, getModalStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import {
    administrators,
    getAllAdministrators,
    removeAdministrator,
    suspendPersonIndefinitely,
    suspendPersonTemporarily,
    updateProfileStatus
  } from '@stores/administrators.store';
  import { getAllProfiles, type Profile, type ProfileStatus } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  const modalStore = getModalStore();

  export let parent: any;

  let profilePictureUrl: string;
  let profile: Profile = $modalStore[0].meta.profile;
  let isTheOnlyAdmin = $administrators.length === 1;
  let suspendedDays = 1;
  let suspensionDate: string;

  onMount(async () => {
    profilePictureUrl = profile?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
      : '/default_avatar.webp';

    if (profile) {
      if (profile.status!.split(' ')[1]) {
        suspensionDate = new Date(profile.status!.split(' ')[1]).toLocaleString();
      }
    }
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

  async function handleSuspendIndefinitely() {
    if (!profile) return;
    const confirmation = confirm('Are you sure you want to suspend this person indefinitely ?');
    if (!confirmation) return;

    await suspendPersonIndefinitely(profile?.original_action_hash!, profile?.previous_action_hash!);

    await getAllProfiles();
    modalStore.close();
  }

  const popupSuspendTemporarily: PopupSettings = {
    event: 'click',
    target: 'popupSuspendTemporarily',
    placement: 'top',
    state(event) {
      if (!event.state) return;
      suspendedDays = 1;
    }
  };

  async function handleSuspendTemporarily() {
    if (!profile) return;
    const confirmation = confirm(
      'Are you sure you want to suspend this person for ' + suspendedDays + ' days ?'
    );
    if (!confirmation) return;

    await suspendPersonTemporarily(
      profile?.original_action_hash!,
      profile?.previous_action_hash!,
      suspendedDays
    );
    await getAllProfiles();
    suspensionDate = new Date(profile?.status!.split(' ')[1]).toLocaleString();
    suspendedDays = 0;
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

<div class="card variant-filled-tertiary w-72 p-4" data-popup="popupSuspendTemporarily">
  <div class="flex flex-col items-center gap-4">
    <p>How many days do you want to suspend this person ?</p>
    <form class="flex justify-around">
      <input
        type="number"
        min="1"
        max="365"
        class="input no-arrows w-2/5"
        bind:value={suspendedDays}
      />
      <button class="btn variant-filled-secondary" on:click={handleSuspendTemporarily}>
        Suspend
      </button>
    </form>
  </div>
  <div class="arrow variant-filled-tertiary" />
</div>

<article
  class="bg-surface-800 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-center text-white shadow-xl md:w-4/5"
>
  {#if profile}
    <h2 class="h2 font-bold">{profile.name}</h2>
    <h3 class="h3"><b>Nickname :</b> {profile.nickname}</h3>
    {#if $page.url.pathname.startsWith('/admin')}
      <p>
        <b>Status :</b>
        {#if !suspensionDate}
          {profile.status}
        {:else}
          suspended until <br /> {suspensionDate}
        {/if}
      </p>
    {/if}
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
        {#if profile?.status === 'pending'}
          <div class="space-x-4">
            <button class="btn variant-filled-tertiary" on:click={() => updateStatus('accepted')}>
              Accept
            </button>
            <button class="btn variant-filled-error" on:click={() => updateStatus('rejected')}>
              Reject
            </button>
          </div>
        {:else if profile?.status === 'rejected'}
          <button class="btn variant-filled-tertiary" on:click={() => updateStatus('accepted')}>
            Accept
          </button>
        {:else if profile?.status === 'accepted'}
          <div class="border-error-600 space-y-4 border-2 p-4">
            <h2 class="h3 text-error-600">Suspend</h2>
            <div class="space-x-2">
              <button class="btn variant-filled-error" use:popup={popupSuspendTemporarily}>
                Temporarily
              </button>
              <button class="btn variant-filled-error" on:click={handleSuspendIndefinitely}>
                Indefinitely
              </button>
            </div>
          </div>
        {:else if profile?.status?.startsWith('suspended')}
          <div class="space-y-4" class:space-x-4={!profile.status?.split(' ')[1]}>
            <button class="btn variant-filled-tertiary" on:click={() => updateStatus('accepted')}>
              Unsuspend
            </button>
            {#if profile.status?.split(' ')[1]}
              <div class="space-x-2">
                <button
                  class="btn variant-filled-error text-sm"
                  use:popup={popupSuspendTemporarily}
                >
                  Change suspension
                </button>
                <button
                  class="btn variant-filled-error text-sm"
                  on:click={handleSuspendIndefinitely}
                >
                  Suspend Indefinitely
                </button>
              </div>
            {:else}
              <button class="btn variant-filled-error text-sm" use:popup={popupSuspendTemporarily}>
                Suspend for a period
              </button>
            {/if}
          </div>
        {/if}
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
