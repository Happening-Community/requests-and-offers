<script lang="ts">
  import { myUser } from '@stores/users.store';
  import type { Record } from '@holochain/client';
  import NavButton from '@lib/NavButton.svelte';
  import { agentIsAdministrator } from '@stores/administrators.store';
</script>

<section class="flex flex-col items-center">
  {#if $agentIsAdministrator}
    <div class="absolute left-10 top-40 flex flex-col items-center gap-2">
      <a class="btn bg-red-600 text-white hover:text-black" href="/admin"> Admin zone </a>
      <span><kbd class="kbd bg-red-300">Alt</kbd> + <kbd class="kbd bg-red-300">A</kbd></span>
    </div>
  {/if}
  {#if $myUser && !$agentIsAdministrator}
    <div class="absolute left-10 top-40 flex flex-col items-center gap-2">
      <p>
        Register as administrator : <kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">Shift</kbd> +
        <kbd class="kbd">A</kbd>
      </p>
    </div>
    <!--  -->
  {/if}
  {#if !$myUser}
    <p class="mb-4 text-center text-xl">It looks like you don't have a user profile yet !</p>
    <NavButton href="user/create">Create profile</NavButton>
  {:else}
    <h2 class="h2 mb-10">Welcome {$myUser.name} !</h2>
    <a href="user" class="btn variant-filled-primary w-fit text-white">View profile</a>
  {/if}
</section>
