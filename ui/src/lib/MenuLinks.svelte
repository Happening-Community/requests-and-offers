<script lang="ts">
  import { page } from '$app/stores';
  import usersStore from '@/stores/users.store.svelte';
  import { onMount } from 'svelte';
  import type { UIUser } from '@/types/ui';
  import MenuLink from './MenuLink.svelte';
  import administrationStore from '@stores/administration.store.svelte';

  let currentUser: UIUser | null = $state(null);

  onMount(async () => {
    currentUser = await usersStore.getCurrentUser();
  });

  const { agentIsAdministrator } = $derived(administrationStore);
</script>

<div class="flex flex-col gap-3">
  {#if currentUser}
    <MenuLink href="/user">My profile</MenuLink>
  {:else}
    <MenuLink href="/user/create">Create Profile</MenuLink>
  {/if}
  <MenuLink href="/users">All Users</MenuLink>
</div>
<div class="flex flex-col gap-3">
  <MenuLink href="/organizations">Organizations</MenuLink>
  <MenuLink href="/projects">Projects</MenuLink>
</div>
<div class="flex flex-col gap-3">
  <MenuLink href="/requests">Requests</MenuLink>
  <MenuLink href="/offers">Offers</MenuLink>
</div>
{#if agentIsAdministrator}
  <div class="flex flex-col gap-3 lg:hidden">
    <MenuLink
      href="/admin"
      className="variant-ringed-secondary text-white hover:variant-filled-secondary"
    >
      Admin panel
    </MenuLink>
  </div>
{/if}
