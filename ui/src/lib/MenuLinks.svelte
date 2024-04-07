<script lang="ts">
  import { getDrawerStore } from '@skeletonlabs/skeleton';
  import { myProfile } from '@stores/profiles.store';
  import MenuLink from './MenuLink.svelte';

  const drawerStore = getDrawerStore();

  function closeDrawer() {
    drawerStore.close();
  }
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
  <MenuLink href="/projects">Projects</MenuLink>
  <MenuLink href="/organizations">Organizations</MenuLink>
</div>
<div class="flex flex-col gap-3">
  <MenuLink href="/requests">Requests</MenuLink>
  <MenuLink href="/offers">Offers</MenuLink>
</div>
