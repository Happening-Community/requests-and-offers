<script lang="ts">
  import { goto } from '$app/navigation';
  import usersStore from '@/stores/users.svelte';
  import { Avatar, ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import organizationsStore from '@stores/organizations.svelte';
  import { onMount } from 'svelte';

  let isLoading = $state(true);

  const { acceptedOrganizations } = $derived(organizationsStore);
  const { myProfile } = $derived(usersStore);

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    await organizationsStore.getAcceptedOrganizationsLinks();
    await usersStore.getMyProfile();

    console.log('acceptedOrganizations', acceptedOrganizations);

    isLoading = false;
  });

  function handleCreateOrganization() {
    alert('Create Organization');
  }
</script>

<section class="flex flex-col gap-8">
  <h1 class="h1 text-center">Organizations</h1>

  {#if myProfile}
    <button
      onclick={() => goto('/organizations/create')}
      class="btn variant-filled-primary w-fit self-center">Create Organization</button
    >
  {/if}

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
          <th class="text-center">Email</th>
        </tr>
      </thead>
      <tbody>
        {#each acceptedOrganizations as organization}
          <tr>
            <td class="text-center">
              <Avatar
                src={organization.logo
                  ? URL.createObjectURL(new Blob([new Uint8Array(organization.logo)]))
                  : '/default_avatar.webp'}
              />
            </td>
            <td class="text-center">{organization.name}</td>
            <td class="text-center">{organization.description}</td>
            <td class="text-center">{organization.members.length}</td>
            <td class="text-center">{organization.email}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>
