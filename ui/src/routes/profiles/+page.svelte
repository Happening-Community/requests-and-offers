<script lang="ts">
  import { getAllProfilesZomeCall, profiles } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  onMount(async () => {
    await getAllProfilesZomeCall();
    console.log($profiles);
  });
</script>

<section>
  <h2 class="h2 mb-10">Profiles</h2>

  {#if $profiles}
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {#each $profiles as profile}
          <tr>
            <td>{profile.name}</td>
            <td>
              <a href="/profile/{profile.name}" class="btn variant-filled-primary">View</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No profiles found.</p>
  {/if}
</section>
