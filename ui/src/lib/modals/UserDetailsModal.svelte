<script lang="ts">
  import { page } from '$app/stores';
  import { Avatar, getModalStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import ActionBar from '../ActionBar.svelte';
  import type { UIUser, UIStatus } from '@/types/ui';
  import administrationStore from '@/stores/administration.store.svelte';
  import { AdministrationEntity } from '@/types/holochain';
  import { decodeRecords } from '@/utils';

  const modalStore = getModalStore();
  const user: UIUser = $modalStore[0].meta.user;

  let userPictureUrl = $state('');
  let suspensionDate = $state('');
  let isSuspendedTemporarily = $state(false);
  let userStatus: UIStatus | null = $state(null);

  onMount(async () => {
    userPictureUrl = user?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(user.picture)]))
      : '/default_avatar.webp';
    const userStatusRecord = await administrationStore.getLatestStatusForEntity(
      user.original_action_hash!,
      AdministrationEntity.Users
    );
    userStatus = userStatusRecord ? decodeRecords([userStatusRecord])[0] : null;

    if (user && userStatus!.suspended_until) {
      isSuspendedTemporarily = true;
      suspensionDate = new Date(userStatus!.suspended_until).toLocaleString();
    }
  });
</script>

<article class="hcron-modal">
  {#if user}
    {#if $page.url.pathname.startsWith('/admin')}
      <div class="mb-10">
        <ActionBar entity={user} />
      </div>
    {/if}

    <h2 class="h2 font-bold">{user.name}</h2>
    <h3 class="h3"><b>Nickname :</b> {user.nickname}</h3>
    {#if $page.url.pathname.startsWith('/admin')}
      <p>
        <b>Status :</b>
        {#if !suspensionDate}
          {userStatus?.status_type}
        {:else}
          suspended until <br /> {suspensionDate}
        {/if}
      </p>
      {#if userStatus?.status_type.startsWith('suspended')}
        <p><b>Reason :</b> {userStatus?.reason}</p>
      {/if}
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
  {/if}
  <button class="btn variant-filled-secondary mt-4 w-fit" onclick={() => modalStore.close()}>
    Close
  </button>
</article>
