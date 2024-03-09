<script lang="ts">
  import { goto } from '$app/navigation';
  import CreateProfileBtn from '$lib/CreateProfileBtn.svelte';
  import { getMyProfile, type Profile } from '$lib/stores/profiles';
  import type { Record } from '@holochain/client';
  import hc from '@services/client.service';
  import { onMount } from 'svelte';

  let myProfileRecord: Record | null;

  onMount(async () => {
    myProfileRecord = await hc.callZome('profiles', 'get_my_profile', null);
    console.log('myProfileRecord :', myProfileRecord);
  });
</script>

<section class="flex flex-col items-center">
  {#if !myProfileRecord}
    <CreateProfileBtn />
  {:else}
    <h2 class="h2 mb-10">Welcome !</h2>
    <!-- <h2 class="h2 mb-10">Welcome {myProfile.name} !</h2>
    <button class="btn variant-filled-primary w-fit" on:click={() => goto('/profile')}>
      View profile
    </button> -->
  {/if}
</section>
