<script lang="ts">
  import { goto } from '$app/navigation';
  import CreateProfileBtn from '$lib/CreateProfileBtn.svelte';
  import { getMyProfile } from '$lib/stores/profiles';

  let myProfile = getMyProfile();
</script>

<section class="flex flex-col items-center">
  {#if !myProfile}
    <CreateProfileBtn />
  {:else}
    <h2 class="h2 mb-10">Welcome {myProfile.name} !</h2>
    <button class="btn variant-filled-primary w-fit" on:click={() => goto('/profile')}>
      View profil
    </button>
  {/if}
</section>
