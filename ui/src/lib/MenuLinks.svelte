<script lang="ts">
  import { myProfile } from '@stores/profiles.store';
</script>

<div class="flex flex-col gap-3">
  {#if $myProfile}
    <a href="/profile" class="btn variant-filled-secondary">My profile</a>
  {:else}
    <a href="/profile/create" class="btn variant-filled-secondary">Create profile</a>
  {/if}
  <a href="/profiles" class="btn variant-filled-secondary">All profiles</a>
</div>
<div class="flex flex-col gap-3">
  <a href="/projects" class="btn variant-filled-secondary">Projects</a>
  <a href="/organizations" class="btn variant-filled-secondary">Organizations</a>
</div>
<div class="flex flex-col gap-3">
  <a href="/requests" class="btn variant-filled-secondary">Requests</a>
  <a href="/offers" class="btn variant-filled-secondary">Offers</a>
</div>
