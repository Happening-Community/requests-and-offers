<script lang="ts">
  import { myProfile } from '@stores/profiles.store';
  import MenuLink from './MenuLink.svelte';
  import { agentIsAdministrator } from '@stores/administrators.store';
</script>

<div class="flex flex-col gap-3">
  {#if $myProfile}
    <MenuLink href="/profile">My profile</MenuLink>
  {:else}
    <MenuLink href="/profile/create">Create profile</MenuLink>
  {/if}
  <MenuLink href="/profiles">All profiles</MenuLink>
</div>
<div class="flex flex-col gap-3">
  <MenuLink href="/organizations">Organizations</MenuLink>
  <MenuLink href="/projects">Projects</MenuLink>
</div>
<div class="flex flex-col gap-3">
  <MenuLink href="/requests">Requests</MenuLink>
  <MenuLink href="/offers">Offers</MenuLink>
</div>
{#if $agentIsAdministrator}
  <div class="flex flex-col gap-3 lg:hidden">
    <MenuLink
      href="/admin"
      className="variant-ringed-secondary text-white hover:variant-filled-secondary"
    >
      Admin panel
    </MenuLink>
  </div>
{/if}
