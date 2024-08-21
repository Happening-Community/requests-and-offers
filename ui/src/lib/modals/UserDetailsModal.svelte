<script lang="ts">
  import { page } from '$app/stores';
  import type { ActionHash } from '@holochain/client';
  import { Avatar, getModalStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import administratorsStore from '@stores/administrators.svelte';
  import { type User, type UserStatus } from '@stores/users.svelte';
  import { onMount } from 'svelte';

  const { administrators } = $derived(administratorsStore);
  const modalStore = getModalStore();

  let userPictureUrl = $state('');
  let user: User = $modalStore[0].meta.user;
  let isTheOnlyAdmin = $derived(administrators.length === 1);
  let suspendedDays = $state(1);
  let suspensionDate = $state('');
  let isSuspendedTemporarily = $state(false);

  onMount(async () => {
    userPictureUrl = user?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(user.picture)]))
      : '/default_avatar.webp';

    if (user && user.status!.split(' ')[1]) {
      isSuspendedTemporarily = true;
      suspensionDate = new Date(user.status!.split(' ')[1]).toLocaleString();
    }
  });

  async function updateStatus(status: UserStatus) {
    if (!user) return;

    let statusMessage = '';
    switch (status) {
      case 'accepted':
        statusMessage = 'accept';
        break;
      case 'rejected':
        statusMessage = 'reject';
        break;
      default:
        statusMessage = 'suspend';
        break;
    }

    const confirmMessage = `Are you sure you want to ${statusMessage} ${isSuspendedTemporarily ?? 'back'} this user ?`;

    const confirmation = confirm(confirmMessage);
    if (!confirmation) return;

    const statusOriginalActionHash = (await administratorsStore.getProfileStatusLink(
      user?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForUser(
      user?.original_action_hash!
    ))!.signed_action.hashed.hash;

    await administratorsStore.updateUserStatus(
      user.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash,
      status
    );
    await administratorsStore.getAllUsers();

    modalStore.close();
  }

  async function handleSuspendIndefinitely() {
    if (!user) return;
    const confirmation = confirm('Are you sure you want to suspend this user indefinitely ?');
    if (!confirmation) return;

    const statusOriginalActionHash = (await administratorsStore.getProfileStatusLink(
      user?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForUser(
      user?.original_action_hash!
    ))!.signed_action.hashed.hash;

    await administratorsStore.suspendUserIndefinitely(
      user.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash
    );

    await administratorsStore.getAllUsers();
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
    if (!user) return;
    const confirmation = confirm(
      'Are you sure you want to suspend this user for ' + suspendedDays + ' days ?'
    );
    if (!confirmation) return;

    const statusOriginalActionHash = (await administratorsStore.getProfileStatusLink(
      user?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForUser(
      user?.original_action_hash!
    ))!.signed_action.hashed.hash;

    await administratorsStore.suspendUserTemporarily(
      user.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash,
      suspendedDays
    );
    await administratorsStore.getAllUsers();
    suspensionDate = new Date(user?.status!.split(' ')[1]).toLocaleString();
    suspendedDays = 0;
    modalStore.close();
  }

  async function handleRemoveAdmin(original_action_hash: ActionHash) {
    const confirmation = confirm('Are you sure you want to remove this administrator ?');
    if (!confirmation) return;

    await administratorsStore.removeAdministrator(original_action_hash);
    await administratorsStore.getAllAdministrators();
    modalStore.close();
  }
</script>

<div
  class="card variant-filled-tertiary z-10 w-72 p-4 shadow-xl"
  data-popup="popupSuspendTemporarily"
>
  <div class="flex flex-col items-center gap-4">
    <p class="h4 text-center">How many days do you want to suspend this user ?</p>
    <form class="flex gap-4">
      <input type="number" min="1" max="365" class="input text-white" bind:value={suspendedDays} />
      <button class="btn variant-filled-secondary" onclick={handleSuspendTemporarily}>
        Suspend
      </button>
    </form>
  </div>
  <div class="arrow variant-filled-tertiary"></div>
</div>

<article
  class="bg-surface-800 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-center text-white shadow-xl md:w-4/5"
>
  {#if user}
    <h2 class="h2 font-bold">{user.name}</h2>
    <h3 class="h3"><b>Nickname :</b> {user.nickname}</h3>
    {#if $page.url.pathname.startsWith('/admin')}
      <p>
        <b>Status :</b>
        {#if !suspensionDate}
          {user.status}
        {:else}
          suspended until <br /> {suspensionDate}
        {/if}
      </p>
    {/if}
    <div onload={() => URL.revokeObjectURL(userPictureUrl)}>
      <Avatar src={userPictureUrl} width="w-64" background="none" />
    </div>
    <p>{user.bio}</p>
    <p><b>Type :</b> {user.user_type}</p>
    {#if user.skills?.length}
      <p><b>Skills :</b> {user.skills?.join(', ')}</p>
    {/if}
    <p><b>Email :</b> {user.email}</p>
    {#if user.phone}
      <p><b>Phone number :</b> {user.phone}</p>
    {/if}
    {#if user.time_zone}
      <p><b>Timezone :</b> {user.time_zone}</p>
    {/if}
    {#if user.location}
      <p><b>Location :</b> {user.location}</p>
    {/if}
    <div class="mt-5 flex flex-col items-center gap-4">
      {#if $page.url.pathname === '/admin/users'}
        {#if user?.status === 'pending'}
          <div class="space-x-4">
            <button class="btn variant-filled-tertiary" onclick={() => updateStatus('accepted')}>
              Accept
            </button>
            <button class="btn variant-filled-error" onclick={() => updateStatus('rejected')}>
              Reject
            </button>
          </div>
        {:else if user?.status === 'rejected'}
          <button class="btn variant-filled-tertiary" onclick={() => updateStatus('accepted')}>
            Accept
          </button>
        {:else if user?.status === 'accepted'}
          <div class="border-error-600 space-y-4 border-2 p-4">
            <h2 class="h3 text-error-600">Suspend</h2>
            <div class="space-x-2">
              <button class="btn variant-filled-error" use:popup={popupSuspendTemporarily}>
                Temporarily
              </button>
              <button class="btn variant-filled-error" onclick={handleSuspendIndefinitely}>
                Indefinitely
              </button>
            </div>
          </div>
        {:else if user?.status?.startsWith('suspended')}
          <div class="space-y-4" class:space-x-4={!isSuspendedTemporarily}>
            <button class="btn variant-filled-tertiary" onclick={() => updateStatus('accepted')}>
              Unsuspend
            </button>
            {#if isSuspendedTemporarily}
              <div class="space-x-2">
                <button
                  class="btn variant-filled-error text-sm"
                  use:popup={popupSuspendTemporarily}
                >
                  Change suspension
                </button>
                <button
                  class="btn variant-filled-error text-sm"
                  onclick={handleSuspendIndefinitely}
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
            onclick={() =>
              user.original_action_hash && handleRemoveAdmin(user.original_action_hash)}
            disabled={isTheOnlyAdmin}
            title={isTheOnlyAdmin ? 'Can not remove last admin' : ''}
          >
            Remove Admin
          </button>
        </div>
      {/if}
      <button class="btn variant-filled-secondary w-fit" onclick={() => modalStore.close()}>
        Close
      </button>
    </div>
  {/if}
</article>
