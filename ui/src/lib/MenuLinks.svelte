<script lang="ts">
  import usersStore from '@stores/users.svelte';
  import MenuLink from './MenuLink.svelte';
  import administratorsStore from '@stores/administrators.svelte';

  const { myProfile } = usersStore;
  const { agentIsAdministrator } = $derived(administratorsStore);
</script>

<div class="flex flex-col gap-3">
  {#if myProfile}
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
