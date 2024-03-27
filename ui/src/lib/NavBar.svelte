<script lang="ts">
  import { myProfile } from '@stores/profiles.store';
</script>

<nav class="bg-primary-500 absolute flex h-32 w-full items-center justify-between gap-4 p-4">
  <a href="/" class="w-1/3"><img src="/hAppeningsLogoWsun2.webp" alt="" class="w-28" /></a>

  <a class="h2 text-center text-white" href="/">Requests and Offers hApp</a>

  <div class="flex w-1/3 flex-col justify-end gap-4 sm:flex-row">
    {#if $myProfile}
      <a href="/profile" class="btn variant-filled-secondary">My profile</a>
    {/if}
    <a href="/profiles" class="btn variant-filled-secondary">All profiles</a>
  </div>
</nav>
