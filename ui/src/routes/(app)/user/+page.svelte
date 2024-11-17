<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getModalStore,
    Avatar,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import type { Revision, UIOrganization, UIStatus, UIUser } from '@/types/ui';
  import usersStore from '@/stores/users.store.svelte';
  import administrationStore from '@stores/administration.store.svelte';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import StatusHistoryModal from '@lib/modals/StatusHistoryModal.svelte';
  import NavButton from '@lib/NavButton.svelte';

  const modalStore = getModalStore();
  const { currentUser } = $derived(usersStore);

  // Memoized user picture URL to prevent unnecessary recreations
  let userPictureUrl = $derived.by(() =>
    currentUser?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(currentUser.picture)]))
      : '/default_avatar.webp'
  );

  // State with more explicit error handling
  let error = $state<string | null>(null);
  let suspensionDate = $state('');
  let isExpired = $state(false);
  let status: UIStatus | null = $state(null);

  // Cached organizations to reduce unnecessary fetches
  let organizations: UIOrganization[] = $state([]);
  let myOrganizations: UIOrganization[] = $state([]);
  let myCoordinatedOrganizations: UIOrganization[] = $state([]);

  $inspect('Current user:', currentUser);
  // Consolidated data fetching with error handling
  async function fetchUserData() {
    console.log('Fetching user data...');

    try {
      // Refresh current user with error handling
      await usersStore.refreshCurrentUser();

      // Update the current user and the users list
      if (!currentUser) {
        error = 'No user profile found';
        return;
      }

      // Fetch status with error handling
      status = await administrationStore.getLatestStatus(currentUser.status!);

      console.log('Status:', status);

      // Optimize organization fetching
      if (currentUser.organizations?.length) {
        const orgPromises = currentUser.organizations.map((link) =>
          organizationsStore.getLatestOrganization(link)
        );
        organizations = (await Promise.allSettled(orgPromises))
          .filter((result) => result.status === 'fulfilled' && result.value)
          .map((result) => (result as PromiseFulfilledResult<UIOrganization>).value);
      }

      // Handle suspension status
      if (status?.suspended_until) {
        const date = new Date(status.suspended_until);
        const now = new Date();

        isExpired = date < now;
        suspensionDate = date.toLocaleDateString();
      }

      // Fetch user organizations
      myOrganizations = await organizationsStore.getUserOrganizations(
        currentUser.original_action_hash!
      );
      myCoordinatedOrganizations = await organizationsStore.getUserCoordinatedOrganizations(
        currentUser.original_action_hash!
      );
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      error = 'Failed to load user data. Please try again later.';
    }
  }

  onMount(fetchUserData);

  const statusHistoryModalComponent: ModalComponent = { ref: StatusHistoryModal };
  const statusHistoryModal = (statusHistory: Revision[]): ModalSettings => {
    return {
      type: 'component',
      component: statusHistoryModalComponent,
      meta: {
        username: currentUser?.name || 'Unknown User',
        statusHistory
      }
    };
  };

  async function handleStatusHistoryModal() {
    try {
      const statusHistory = await administrationStore.getAllRevisionsForStatus(
        currentUser?.status!
      );

      modalStore.trigger(statusHistoryModal(statusHistory));
      modalStore.update((modals) => modals.reverse());
    } catch (err) {
      console.error('Failed to fetch status history:', err);
      // Optionally show an error toast or modal
    }
  }
</script>

<section class="flex flex-col items-center">
  {#if error}
    <div class="alert variant-filled-error">
      <p>{error}</p>
    </div>
  {:else if !currentUser}
    <p class="mb-4 text-center text-xl">It looks like you don't have a user profile yet!</p>
    <NavButton href="/user/create">Create Profile</NavButton>
  {:else}
    <div class="mb-10 flex flex-col items-center gap-5">
      <h2 class="h2">
        Welcome <span class="text-primary-500 font-bold">{currentUser.name}</span> !
      </h2>
      <a href="/user/edit" class="btn variant-filled-primary w-fit text-white">Edit profile</a>
    </div>
    <div
      class="border-surface-600 bg-surface-400 flex w-4/5 min-w-96 flex-col items-center gap-5 rounded-xl border-8 p-5 drop-shadow-xl"
    >
      <h3 class="h3"><b>Nickname :</b> {currentUser.nickname}</h3>
      <h3 class="h3 text-wrap text-center">
        <b>Status :</b>
        <span
          class:text-primary-500={status?.status_type === 'pending'}
          class:text-error-500={status?.status_type === 'rejected' ||
            status?.status_type === 'suspended indefinitely'}
          class:text-green-400={status?.status_type === 'accepted'}
          class:text-warning-500={status?.status_type === `suspended temporarily`}
        >
          {#if !suspensionDate}
            {status?.status_type}
          {:else}
            {isExpired ? 'In review' : 'suspended temporarily'}
          {/if}
        </span>
      </h3>
      {#if status?.status_type.startsWith('suspended')}
        <p class=" text-wrap text-center"><b>Reason :</b> {status?.reason}</p>
        {#if suspensionDate}
          <p class=" text-wrap text-center">
            <b>Suspended until :</b>
            {suspensionDate}
          </p>
        {/if}
      {/if}

      <button class="btn variant-filled-secondary" onclick={handleStatusHistoryModal}>
        Status History
      </button>

      <div onload={() => URL.revokeObjectURL(userPictureUrl)}>
        <Avatar src={userPictureUrl} width="w-64" background="none" />
      </div>
      <p class="text-center">{currentUser.bio}</p>
      <p><b>Type :</b> {currentUser.user_type}</p>
      {#if currentUser.skills?.length}
        <p class="text-center"><b>Skills :</b> {currentUser.skills?.join(', ')}</p>
      {/if}
      <p><b>Email :</b> {currentUser.email}</p>
      {#if currentUser.phone}
        <p><b>Phone number :</b> {currentUser.phone}</p>
      {/if}
      {#if currentUser.time_zone}
        <p><b>Timezone :</b> {currentUser.time_zone}</p>
      {/if}
      {#if currentUser.location}
        <p><b>Location :</b> {currentUser.location}</p>
      {/if}
      {#if organizations.length > 0}
        <h3 class="h3">My Organizations</h3>
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Location</th>
              <th># Members</th>
            </tr></thead
          >
          <tbody>
            {#each organizations as organization}
              <tr>
                <td>{organization.name}</td>
                <td>{organization.description}</td>
                <td>{organization.location}</td>
                <td>{organization.members.length}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
      {#if myOrganizations.length > 0}
        <h3 class="h3">My Organizations</h3>
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Location</th>
              <th># Members</th>
            </tr></thead
          >
          <tbody>
            {#each myOrganizations as organization}
              <tr>
                <td>{organization.name}</td>
                <td>{organization.description}</td>
                <td>{organization.location}</td>
                <td>{organization.members.length}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
      {#if myCoordinatedOrganizations.length > 0}
        <h3 class="h3">My Coordinated Organizations</h3>
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Location</th>
              <th># Members</th>
            </tr></thead
          >
          <tbody>
            {#each myCoordinatedOrganizations as organization}
              <tr>
                <td>{organization.name}</td>
                <td>{organization.description}</td>
                <td>{organization.location}</td>
                <td>{organization.members.length}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {/if}
</section>
