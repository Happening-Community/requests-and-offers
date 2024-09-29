<script lang="ts">
  import { page } from '$app/stores';
  import { Avatar, getModalStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import ActionBar from '../ActionBar.svelte';
  import type { User } from '@/stores/users.svelte';

  const modalStore = getModalStore();
  const user: User = $modalStore[0].meta.user;

  let userPictureUrl = $state('');
  let suspensionDate = $state('');
  let isSuspendedTemporarily = $state(false);

  onMount(async () => {
    userPictureUrl = user?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(user.picture)]))
      : '/default_avatar.webp';

    if (user && user.status!.suspended_until) {
      isSuspendedTemporarily = true;
      suspensionDate = new Date(user.status!.suspended_until).toLocaleString();
    }
  });
</script>

<article class="hcron-modal">
  {#if user}
    {#if $page.url.pathname.startsWith('/admin')}
      <div class="mb-10">
        <ActionBar {user} />
      </div>
    {/if}

    <h2 class="h2 font-bold">{user.name}</h2>
    <h3 class="h3"><b>Nickname :</b> {user.nickname}</h3>
    {#if $page.url.pathname.startsWith('/admin')}
      <p>
        <b>Status :</b>
        {#if !suspensionDate}
          {user.status?.status_type}
        {:else}
          suspended until <br /> {suspensionDate}
        {/if}
      </p>
      {#if user.status?.status_type.startsWith('suspended')}
        <p><b>Reason :</b> {user.status?.reason}</p>
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
