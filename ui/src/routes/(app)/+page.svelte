<script lang="ts">
  import { myProfile } from '@stores/profiles.store';
  import type { Record } from '@holochain/client';
  import NavButton from '@lib/NavButton.svelte';
  import { agentIsAdministrator } from '@stores/administrators.store';
</script>

<section class="flex flex-col items-center">
  {#if $agentIsAdministrator}
    <a class="btn absolute left-10 top-40 bg-red-600 text-white hover:text-black" href="/admin">
      Admin zone
    </a>
  {/if}
  {#if !$myProfile}
    <p class="mb-4 text-center text-xl">It looks like you don't have a profile yet !</p>
    <NavButton href="/profile/create" text="Create profile" />
  {:else}
    <h2 class="h2 mb-10">Welcome {$myProfile.name} !</h2>
    <a href="/profile" class="btn variant-filled-primary w-fit text-white">View profile</a>
  {/if}
</section>
