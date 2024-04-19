<script lang="ts">
  import { myProfile, myProfileIsAdmin } from '@stores/profiles.store';
  import MenuLink from './MenuLink.svelte';
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
{#if $myProfileIsAdmin}
  <div class="flex flex-col gap-3 lg:hidden">
    <MenuLink href="/admin">Admin</MenuLink>
  </div>
{/if}
