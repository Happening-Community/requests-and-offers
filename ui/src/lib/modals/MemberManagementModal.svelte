<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Modal, getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import type { UIOrganization, UIUser } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import usersStore from '@/stores/users.store.svelte';
  import administrationStore from '@/stores/administration.store.svelte';
  import OrganizationMembersTable from '../tables/OrganizationMembersTable.svelte';
  import type { ActionHash } from '@holochain/client';
  import { AdministrationEntity, type StatusInDHT } from '@/types/holochain';

  const modalStore = getModalStore();
  const toastStore = getToastStore();
  const { organization } = $modalStore[0].meta as { organization: UIOrganization };

  let newMemberHash = $state<ActionHash | undefined>();
  let loading = $state(false);
  let error = $state<string | null>(null);
  let searchQuery = $state('');
  let sortBy = $state<'name' | 'role' | 'status'>('name');
  let sortOrder = $state<'asc' | 'desc'>('asc');

  const isAdmin = $derived(administrationStore.agentIsAdministrator);

  async function handleAddMember(event: SubmitEvent) {
    event.preventDefault();
    if (!newMemberHash) return;

    try {
      loading = true;
      error = null;

      // Verify user exists
      const user = await usersStore.getLatestUser(newMemberHash);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already a member
      const members = await organizationsStore.getMemberUsers(organization);
      if (members.some((m) => m.original_action_hash === newMemberHash)) {
        throw new Error('User is already a member');
      }

      // Confirm addition
      const confirmed = await new Promise<boolean>((resolve) => {
        modalStore.trigger({
          type: 'confirm',
          title: 'Add Member',
          body: `Are you sure you want to add ${user.name} to the organization?`,
          response: (r: boolean) => resolve(r)
        });
      });

      if (!confirmed) return;

      await organizationsStore.addMember(organization, newMemberHash);
      newMemberHash = undefined;

      toastStore.trigger({
        message: 'Member added successfully',
        background: 'variant-filled-success'
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  }

  async function handleUpdateMemberStatus(member: UIUser, status: StatusInDHT) {
    if (!isAdmin || !member.original_action_hash) return;

    try {
      loading = true;
      const statusLink = await administrationStore.getEntityStatusLink(
        member.original_action_hash,
        AdministrationEntity.Users
      );

      if (!statusLink) {
        throw new Error('Could not find status link');
      }

      const currentStatus = await administrationStore.getLatestStatusRecordForEntity(
        member.original_action_hash,
        AdministrationEntity.Users
      );

      if (!currentStatus) {
        throw new Error('Could not find current status');
      }

      await administrationStore.updateUserStatus(
        member.original_action_hash,
        statusLink.target,
        currentStatus.signed_action.hashed.hash,
        status
      );

      toastStore.trigger({
        message: 'Member status updated successfully',
        background: 'variant-filled-success'
      });
    } catch (error) {
      console.error('Error updating member status:', error);
      toastStore.trigger({
        message: 'Failed to update member status',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

  // Cleanup on component destroy
  $effect(() => {
    return () => {
      error = null;
      newMemberHash = undefined;
    };
  });
</script>

<Modal background="bg-surface-100-800-token" width="w-modal">
  <div class="card p-4">
    <header class="card-header">
      <h3 class="h3">Manage Members</h3>
      <hr class="my-4 !border-t-2" />
    </header>

    {#if error}
      <div class="alert variant-filled-error mb-4">
        {error}
      </div>
    {/if}

    <!-- Add Member Form -->
    <form class="card mb-4 p-4" onsubmit={handleAddMember}>
      <div class="flex gap-2">
        <label class="label flex-1">
          <span class="label-text">Add Member</span>
          <input
            class="input"
            type="text"
            bind:value={newMemberHash}
            placeholder="Enter member hash..."
            aria-label="Member hash"
          />
        </label>
        <button
          type="submit"
          class="btn variant-filled-primary self-end"
          disabled={loading || !newMemberHash}
        >
          {#if loading}
            Loading...
          {:else}
            Add Member
          {/if}
        </button>
      </div>
    </form>

    <!-- Search and Sort Controls -->
    <div class="card mb-4 p-4">
      <div class="flex gap-4">
        <label class="label flex-1">
          <span class="label-text">Search Members</span>
          <input
            class="input"
            type="text"
            bind:value={searchQuery}
            placeholder="Search by name..."
            aria-label="Search members"
          />
        </label>
        <label class="label">
          <span class="label-text">Sort By</span>
          <select class="select" bind:value={sortBy}>
            <option value="name">Name</option>
            <option value="role">Role</option>
            <option value="status">Status</option>
          </select>
        </label>
        <button
          class="btn btn-sm variant-ghost-surface self-end"
          onclick={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>

    <!-- Members Table -->
    <div class="card p-4">
      <OrganizationMembersTable {organization} {searchQuery} {sortBy} {sortOrder} />
    </div>
  </div>
</Modal>
