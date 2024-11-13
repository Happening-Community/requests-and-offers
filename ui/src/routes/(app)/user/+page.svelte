<script lang="ts">
  import {
    Avatar,
    getModalStore,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import NavButton from '@lib/NavButton.svelte';
  import { onMount } from 'svelte';
  import usersStore from '@stores/users.svelte';
  import administratorsStore, {
    AdministrationEntity,
    type Revision,
    type Status
  } from '@stores/administrators.svelte';
  import StatusHistoryModal from '@lib/modals/StatusHistoryModal.svelte';
  import type { Organization } from '@/stores/organizations.svelte';
  import organizationsStore from '@/stores/organizations.svelte';

  const modalStore = getModalStore();
  const { myProfile } = $derived(usersStore);

  let userPictureUrl = $derived(
    myProfile?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(myProfile.picture)]))
      : '/default_avatar.webp'
  );

  let suspensionDate = $state('');
  let isExpired = $state(false);
  let status: Status | null = $state(null);
  let organizations: Organization[] = $state([]);

  onMount(async () => {
    await usersStore.getMyProfile();
    status = await administratorsStore.getLatestStatusForEntity(
      myProfile!.original_action_hash!,
      AdministrationEntity.Users
    );

    for (const link of myProfile!.organizations!) {
      const organization = await organizationsStore.getLatestOrganization(link);
      if (organization) organizations.push(organization);
    }

    if (myProfile) {
      if (status!.suspended_until) {
        const date = new Date(status!.suspended_until);
        const dateString = date.toString();
        const now = new Date();

        isExpired = date < now;

        suspensionDate = dateString.substring(0, dateString.indexOf(' ', 15));
      }
    }
  });

  const statusHistoryModalComponent: ModalComponent = { ref: StatusHistoryModal };
  const statusHistoryModal = (statusHistory: Revision[]): ModalSettings => {
    return {
      type: 'component',
      component: statusHistoryModalComponent,
      meta: {
        statusHistory
      }
    };
  };

  async function handleStatusHistoryModal() {
    const userStatus = await administratorsStore.getUserStatusLink(
      myProfile!.original_action_hash!
    );
    const statusHistory = await administratorsStore.getAllRevisionsForStatus(
      userStatus!.target,
      myProfile!
    );

    modalStore.trigger(statusHistoryModal(statusHistory));
    modalStore.update((modals) => modals.reverse());
  }
</script>

<section class="flex flex-col items-center">
  {#if !myProfile}
    <p class="mb-4 text-center text-xl">It looks like you don't have a user profile yet !</p>
    <NavButton href="/user/create">Create Profile</NavButton>
  {:else}
    <div class="mb-10 flex flex-col items-center gap-5">
      <h2 class="h2">
        Welcome <span class="text-primary-500 font-bold">{myProfile.name}</span> !
      </h2>
      <a href="/user/edit" class="btn variant-filled-primary w-fit text-white">Edit profile</a>
    </div>
    <div
      class="border-surface-600 bg-surface-400 flex w-4/5 min-w-96 flex-col items-center gap-5 rounded-xl border-8 p-5 drop-shadow-xl"
    >
      <h3 class="h3"><b>Nickname :</b> {myProfile.nickname}</h3>
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
      <p class="text-center">{myProfile.bio}</p>
      <p><b>Type :</b> {myProfile.user_type}</p>
      {#if myProfile.skills?.length}
        <p class="text-center"><b>Skills :</b> {myProfile.skills?.join(', ')}</p>
      {/if}
      <p><b>Email :</b> {myProfile.email}</p>
      {#if myProfile.phone}
        <p><b>Phone number :</b> {myProfile.phone}</p>
      {/if}
      {#if myProfile.time_zone}
        <p><b>Timezone :</b> {myProfile.time_zone}</p>
      {/if}
      {#if myProfile.location}
        <p><b>Location :</b> {myProfile.location}</p>
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
    </div>
  {/if}
</section>
