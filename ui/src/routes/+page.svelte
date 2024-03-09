<script lang="ts">
  import CreateProfileBtn from '$lib/CreateProfileBtn.svelte';
  import { getMyProfileZomeCall, myProfile } from '@stores/profiles.store';
  import type { Record } from '@holochain/client';
  import { onMount } from 'svelte';

  onMount(async () => {
    await getMyProfileZomeCall();
  });

  $: console.log('myProfile :', $myProfile);
</script>

<section class="flex flex-col items-center">
  {#if !$myProfile}
    <CreateProfileBtn />
  {:else}
    <h2 class="h2 mb-10">Welcome !</h2>
    <!-- <h2 class="h2 mb-10">Welcome {myProfile.name} !</h2>
    <button class="btn variant-filled-primary w-fit" on:click={() => goto('/profile')}>
      View profile
    </button> -->
  {/if}
</section>
