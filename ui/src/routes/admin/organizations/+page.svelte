<script lang="ts">
  import { createMockedOrganizations } from '@mocks';
  import { Avatar, ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import { organizations } from '@stores/organizations.store';
  import { onMount } from 'svelte';

  $: isLoading = true;

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    if ($organizations.length === 0) {
      const mockedOrganizations = await createMockedOrganizations(3);
      organizations.set(mockedOrganizations);
    }
    isLoading = false;
    console.log('organizations :', $organizations);
  });
</script>

<section class="flex flex-col gap-8">
  <h1 class="h1">Organizations</h1>

  {#if isLoading}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th class="text-center">Logo</th>
          <th class="text-center">Name</th>
          <th class="text-center">Description</th>
          <th class="text-center"># Members</th>
          <th class="text-center"># Projects</th>
        </tr>
      </thead>
      <tbody>
        {#each $organizations as organization}
          <tr>
            <td class="text-center">
              <Avatar
                src={organization.picture
                  ? URL.createObjectURL(new Blob([new Uint8Array(organization.picture)]))
                  : '/default_avatar.webp'}
              />
            </td>
            <td class="text-center">{organization.name}</td>
            <td class="text-center">{organization.description}</td>
            <td class="text-center">{organization.members.length}</td>
            <td class="text-center">{organization.projects.length}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>
