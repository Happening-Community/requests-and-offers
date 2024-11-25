<script lang="ts">
  import { page } from '$app/stores';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import type { Revision, UIOrganization, UIUser } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import OrganizationMembersTable from '@/lib/tables/OrganizationMembersTable.svelte';
  import OrganizationCoordinatorsTable from '@/lib/tables/OrganizationCoordinatorsTable.svelte';
  import MemberManagementModal from '@/lib/modals/MemberManagementModal.svelte';
  import { decodeHashFromBase64, type ActionHash } from '@holochain/client';
  import type { StatusInDHT } from '@/types/holochain';
  import administrationStore from '@/stores/administration.store.svelte';
  import { AdministrationEntity } from '@/types/holochain';
  import { Avatar, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import StatusHistoryModal from '@lib/modals/StatusHistoryModal.svelte';
  import usersStore from '@/stores/users.store.svelte';

  const modalStore = getModalStore();
  const toastStore = getToastStore();
  const organizationHashString = $page.params.id;
  const organizationHash = decodeHashFromBase64(organizationHashString) as ActionHash;

  let agentIsAdministrator = $state(false);
  let organization: UIOrganization | null = $state(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let members: UIUser[] = $state([]);
  let coordinators: UIUser[] = $state([]);

  // Table controls
  let memberSearchQuery = $state('');
  let memberSortBy = $state<'name' | 'role' | 'status'>('name');
  let memberSortOrder = $state<'asc' | 'desc'>('asc');

  let coordinatorSearchQuery = $state('');
  let coordinatorSortBy = $state<'name' | 'status'>('name');
  let coordinatorSortOrder = $state<'asc' | 'desc'>('asc');

  const isAdmin = $derived(administrationStore.agentIsAdministrator);

  function getStatusClass(status?: string): string {
    if (!status) return 'variant-filled-surface';

    switch (status) {
      case 'accepted':
        return 'variant-filled-success';
      case 'suspended':
        return 'variant-filled-warning';
      case 'inactive':
        return 'variant-filled-error';
      default:
        return 'variant-filled-surface';
    }
  }

  async function handleUpdateOrganizationStatus(status: StatusInDHT) {
    if (!organization?.original_action_hash || !isAdmin) return;

    try {
      loading = true;
      const statusLink = await administrationStore.getEntityStatusLink(
        organization.original_action_hash,
        AdministrationEntity.Organizations
      );

      if (!statusLink) {
        throw new Error('Could not find status link');
      }

      const currentStatus = await administrationStore.getLatestStatusForEntity(
        organization.original_action_hash,
        AdministrationEntity.Organizations
      );

      if (!currentStatus) {
        throw new Error('Could not find current status');
      }

      await administrationStore.updateOrganizationStatus(
        organization.original_action_hash,
        statusLink.target,
        currentStatus.signed_action.hashed.hash,
        status
      );

      toastStore.trigger({
        message: 'Organization status updated successfully',
        background: 'variant-filled-success'
      });

      await loadOrganization();
    } catch (e) {
      console.error('Error updating organization status:', e);
      toastStore.trigger({
        message: 'Failed to update organization status',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

  function openStatusUpdateModal(
    user: UIUser,
    onUpdate: (user: UIUser, status: StatusInDHT) => void
  ) {
    if (!organization || !isAdmin) return;

    modalStore.trigger({
      type: 'component',
      component: {
        ref: 'StatusUpdateModal',
        props: {
          entity: user,
          onUpdate: (status: StatusInDHT) => onUpdate(user, status)
        }
      }
    });
  }

  function openOrganizationStatusUpdateModal() {
    if (!organization || !isAdmin) return;

    modalStore.trigger({
      type: 'component',
      component: {
        ref: 'StatusUpdateModal',
        props: {
          entity: organization,
          onUpdate: handleUpdateOrganizationStatus
        }
      }
    });
  }

  async function handleRemoveCoordinator(coordinator: UIUser) {
    if (!organization || !coordinator.original_action_hash || coordinators.length <= 1) return;

    try {
      // Confirm removal
      const confirmed = await new Promise<boolean>((resolve) => {
        modalStore.trigger({
          type: 'confirm',
          title: 'Remove Coordinator',
          body: `Are you sure you want to remove ${coordinator.name} as a coordinator? This action cannot be undone.`,
          response: (r: boolean) => resolve(r)
        });
      });

      if (!confirmed) return;

      loading = true;
      const success = await organizationsStore.removeCoordinator(
        organization,
        coordinator.original_action_hash
      );

      if (success) {
        toastStore.trigger({
          message: `${coordinator.name} has been removed as coordinator`,
          background: 'variant-filled-success'
        });
        await loadOrganization();
      } else {
        throw new Error('Failed to remove coordinator');
      }
    } catch (e) {
      console.error('Error removing coordinator:', e);
      toastStore.trigger({
        message: 'Failed to remove coordinator',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

  async function handleUpdateUserStatus(user: UIUser, status: StatusInDHT) {
    if (!isAdmin || !user.original_action_hash) return;

    try {
      loading = true;
      const statusLink = await administrationStore.getEntityStatusLink(
        user.original_action_hash,
        AdministrationEntity.Users
      );

      if (!statusLink) {
        throw new Error('Could not find status link');
      }

      const currentStatus = await administrationStore.getLatestStatusForEntity(
        user.original_action_hash,
        AdministrationEntity.Users
      );

      if (!currentStatus) {
        throw new Error('Could not find current status');
      }

      await administrationStore.updateUserStatus(
        user.original_action_hash,
        statusLink.target,
        currentStatus.signed_action.hashed.hash,
        status
      );

      toastStore.trigger({
        message: `${user.name}'s status updated successfully`,
        background: 'variant-filled-success'
      });

      await loadOrganization();
    } catch (e) {
      console.error('Error updating user status:', e);
      toastStore.trigger({
        message: 'Failed to update user status',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

  async function loadOrganization() {
    try {
      loading = true;
      error = null;
      organization = await organizationsStore.getLatestOrganization(organizationHash);
      if (!organization) {
        throw new Error('Organization not found');
      }
      if (!organization.original_action_hash || !usersStore.currentUser?.original_action_hash)
        return;

      // Load members and coordinators
      members = await organizationsStore.getMemberUsers(organization);
      coordinators = await organizationsStore.getCoordinatorUsers(organization);

      agentIsAdministrator = await organizationsStore.isOrganizationCoordinator(
        organization.original_action_hash,
        usersStore.currentUser?.original_action_hash
      );
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
      organization = null;
    } finally {
      loading = false;
    }
  }

  function handleOpenMemberModal() {
    if (!organization) return;

    modalStore.trigger({
      type: 'component',
      component: {
        ref: MemberManagementModal,
        props: { organization }
      }
    });
  }

  async function handleDeleteOrganization() {
    if (!organization) return;

    try {
      // Confirm deletion
      const confirmed = await new Promise<boolean>((resolve) => {
        modalStore.trigger({
          type: 'confirm',
          title: 'Delete Organization',
          body: 'Are you sure you want to delete this organization? This action cannot be undone.',
          response: (r: boolean) => resolve(r)
        });
      });

      if (!confirmed) return;

      loading = true;
      await organizationsStore.deleteOrganization(organizationHash);

      toastStore.trigger({
        message: 'Organization deleted successfully',
        background: 'variant-filled-success'
      });

      // Navigate back to organizations list
      window.history.back();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
      toastStore.trigger({
        message: 'Failed to delete organization',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

  async function handleUpdateSettings(event: SubmitEvent) {
    event.preventDefault();
    if (!organization) return;

    try {
      loading = true;
      error = null;
      await organizationsStore.updateOrganization(organizationHash, {
        name: organization.name,
        description: organization.description
      });

      toastStore.trigger({
        message: 'Organization updated successfully',
        background: 'variant-filled-success'
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
      toastStore.trigger({
        message: 'Failed to update organization',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

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
    if (!organization?.original_action_hash) return;

    try {
      const statusLink = await administrationStore.getEntityStatusLink(
        organization.original_action_hash,
        AdministrationEntity.Organizations
      );
      if (!statusLink) return;

      const statusHistory = await administrationStore.getAllRevisionsForStatus(
        organization,
        statusLink.target
      );

      modalStore.trigger(statusHistoryModal(statusHistory));
    } catch (err) {
      console.error('Failed to fetch status history:', err);
      toastStore.trigger({
        message: 'Failed to load status history',
        background: 'variant-filled-error'
      });
    }
  }

  // Memoized organization logo URL
  let organizationLogoUrl = $derived.by(() =>
    organization?.logo
      ? URL.createObjectURL(new Blob([new Uint8Array(organization.logo)]))
      : '/default_avatar.webp'
  );

  // Load organization when the component mounts
  $effect(() => {
    if (organizationHash) {
      loadOrganization();
    }
  });
</script>

<section class="flex flex-col items-center">
  {#if error}
    <div class="alert variant-filled-error" role="alert">
      <p>{error}</p>
      <button class="btn btn-sm variant-soft" onclick={loadOrganization}>Try Again</button>
    </div>
  {:else if loading}
    <div class="flex flex-col items-center gap-4">
      <span class="loading loading-spinner loading-lg"></span>
      <p>Loading organization...</p>
    </div>
  {:else if organization}
    <!-- Organization Header -->
    <div class="card w-full p-6">
      <header class="flex items-center gap-6">
        <Avatar src={organizationLogoUrl} width="w-24" />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h1 class="h1">{organization.name}</h1>
            {#if organization.status}
              <button
                class="badge {getStatusClass(organization.status.status_type)}"
                onclick={handleStatusHistoryModal}
              >
                {organization.status.status_type}
              </button>
            {/if}
          </div>
          <p class="text-lg">{organization.description}</p>
        </div>
      </header>

      <!-- Organization Details -->
      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="card p-4">
          <h3 class="h3 mb-2">Contact</h3>
          <p><strong>Email:</strong> {organization.email}</p>
          <p><strong>Location:</strong> {organization.location}</p>
        </div>
        <div class="card p-4">
          <h3 class="h3 mb-2">Links</h3>
          <ul class="list-inside list-disc">
            {#each organization.urls as url}
              <li>
                <a href={url} target="_blank" rel="noopener noreferrer" class="anchor">{url}</a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <!-- Members Section -->
    <div class="card mt-6 w-full p-6">
      <header class="mb-4 flex items-center justify-between">
        <h2 class="h2">Members ({members.length})</h2>
        {#if organization.coordinators.includes($page?.data?.user?.original_action_hash!)}
          <button
            class="btn variant-filled-primary"
            onclick={() =>
              modalStore.trigger({
                type: 'component',
                component: { ref: MemberManagementModal, props: { organization } }
              })}
          >
            Manage Members
          </button>
        {/if}
      </header>
      {#if members.length === 0}
        <div class="alert variant-ghost-surface" role="alert">No members found.</div>
      {:else}
        <div class="table-container">
          <table class="table-hover table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {#each members as member (member.original_action_hash)}
                <tr>
                  <td class="flex items-center gap-2">
                    <Avatar
                      src={member.picture
                        ? URL.createObjectURL(new Blob([new Uint8Array(member.picture)]))
                        : '/default_avatar.webp'}
                      initials={member.name.slice(0, 2)}
                    />
                    <span>{member.name}</span>
                  </td>
                  <td>
                    <span class="badge variant-filled">
                      {coordinators.some(
                        (coord) => coord.original_action_hash === member.original_action_hash
                      )
                        ? 'Coordinator'
                        : 'Member'}
                    </span>
                  </td>
                  <td>
                    <button
                      class="badge {member.status?.status_type === 'accepted'
                        ? 'variant-filled-success'
                        : member.status?.status_type.startsWith('rejected')
                          ? 'variant-filled-warning'
                          : 'variant-filled-surface'}"
                      onclick={() =>
                        isAdmin && openStatusUpdateModal(member, handleUpdateUserStatus)}
                      disabled={!isAdmin}
                      aria-label={`Update status for ${member.name}`}
                    >
                      {member.status?.status_type || 'No Status'}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

    <!-- Coordinators Section -->
    <div class="card mt-6 w-full p-6">
      <header class="mb-4">
        <h2 class="h2">Coordinators ({coordinators.length})</h2>
      </header>
      {#if coordinators.length === 0}
        <div class="alert variant-ghost-surface" role="alert">No coordinators found.</div>
      {:else}
        <div class="table-container">
          <table class="table-hover table">
            <thead>
              <tr>
                <th>Coordinator</th>
                <th>Status</th>
                {#if agentIsAdministrator}
                  <th>Actions</th>
                {/if}
              </tr>
            </thead>
            <tbody>
              {#each coordinators as coordinator (coordinator.original_action_hash)}
                <tr>
                  <td class="flex items-center gap-2">
                    <Avatar
                      src={coordinator.picture
                        ? URL.createObjectURL(new Blob([new Uint8Array(coordinator.picture)]))
                        : '/default_avatar.webp'}
                      initials={coordinator.name.slice(0, 2)}
                    />
                    <span>{coordinator.name}</span>
                  </td>
                  <td>
                    <button
                      class="badge {coordinator.status?.status_type === 'accepted'
                        ? 'variant-filled-success'
                        : coordinator.status?.status_type.startsWith('rejected')
                          ? 'variant-filled-warning'
                          : 'variant-filled-surface'}"
                      onclick={() =>
                        isAdmin && openStatusUpdateModal(coordinator, handleUpdateUserStatus)}
                      disabled={!isAdmin}
                      aria-label={`Update status for ${coordinator.name}`}
                    >
                      {coordinator.status?.status_type || 'No Status'}
                    </button>
                  </td>
                  {#if agentIsAdministrator && coordinators.length > 1}
                    <td>
                      <button
                        class="btn btn-sm variant-filled-error"
                        onclick={() => handleRemoveCoordinator(coordinator)}
                      >
                        Remove
                      </button>
                    </td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

    <!-- Settings Section -->
    {#if agentIsAdministrator}
      <div class="card mt-6 w-full p-6">
        <header class="mb-4">
          <h2 class="h2">Settings</h2>
        </header>
        <div class="flex gap-4">
          <button class="btn variant-filled-error" onclick={handleDeleteOrganization}>
            Delete Organization
          </button>
          {#if isAdmin}
            <button class="btn variant-filled-warning" onclick={openOrganizationStatusUpdateModal}>
              Update Status
            </button>
          {/if}
        </div>
      </div>
    {/if}
  {:else}
    <div class="flex justify-center p-8">
      <p class="text-surface-600-300-token">Organization not found</p>
    </div>
  {/if}
</section>
