<script lang="ts">
  import type { ActionHash } from '@holochain/client';
  import { getAllProfiles, getAllProfilesLinks, profiles } from '@stores/profiles.store';
  import { onMount } from 'svelte';

  let profilesHashes: ActionHash[];

  onMount(async () => {
    await getAllProfiles();
    profilesHashes = (await getAllProfilesLinks()).map((profile) => profile.target);
    console.log('profilesHashes :', profilesHashes);
  });
</script>

<section>
  <h2 class="h2 mb-10">Profiles</h2>
  {#if $profiles.length === 0}
    <p class="h3 text-error-500">No profiles found.</p>
  {:else if $profiles && profilesHashes}
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {#each $profiles as profile, i}
          <tr>
            <td>{profile.name}</td>
            <td>
              <a href="/profile?id={i}&hash={profilesHashes[i]}" class="btn variant-filled-primary">
                View
              </a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No profiles found.</p>
  {/if}
</section>
