<script lang="ts">
  import CreateProfileBtn from '$lib/CreateProfileBtn.svelte';
  import { myProfile, myProfileIsAdmin } from '@stores/profiles.store';
  import type { Record } from '@holochain/client';
</script>

<section class="flex flex-col items-center">
  {#if $myProfileIsAdmin}
    <a class="btn absolute left-10 top-40 bg-red-600 text-white hover:text-black" href="/admin">
      Admin zone
    </a>
  {/if}
  {#if !$myProfile}
    <p class="mb-4 text-center text-xl">It looks like you don't have a profile yet !</p>
    <CreateProfileBtn />
  {:else}
    <h2 class="h2 mb-10">Welcome {$myProfile.name} !</h2>
    <a href="/profile" class="btn variant-filled-primary w-fit text-white">View profile</a>
  {/if}
</section>
