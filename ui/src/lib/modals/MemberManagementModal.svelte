<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Modal, getModalStore } from '@skeletonlabs/skeleton';
  import type { UIOrganization, UIUser } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import usersStore from '@/stores/users.store.svelte';
  import OrganizationMembersTable from '../tables/OrganizationMembersTable.svelte';
  import type { ActionHash } from '@holochain/client';

  const modalStore = getModalStore();
  const { organization } = $modalStore[0].meta as { organization: UIOrganization };

  let newMemberHash: ActionHash | undefined = $state();
  let loading = $state(false);
  let error: string | null = $state(null);

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

      await organizationsStore.addMember(organization, newMemberHash);
      newMemberHash = undefined;
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  }

  // Cleanup on component destroy
  onDestroy(() => {
    error = null;
    newMemberHash = undefined;
  });
</script>

<Modal
  background="bg-surface-100-800-token"
  width="w-modal"
>
  <div class="card p-4">
    <header class="card-header">
      <h3 class="h3">Manage Members</h3>
      <hr class="!border-t-2 my-4" />
    </header>

    {#if error}
      <div class="alert variant-filled-error mb-4" role="alert">
        {error}
      </div>
    {/if}

    <!-- Add Member Form -->
    <form class="card p-4 mb-8" onsubmit={handleAddMember}>
      <div class="flex gap-2">
        <label class="label flex-1">
          <span class="label-text">Add Member</span>
          <input
            class="input"
            type="text"
            bind:value={newMemberHash}
            placeholder="Enter member hash"
            required
            disabled={loading}
            aria-label="New member hash"
          />
        </label>
        <button
          type="submit"
          class="btn btn-sm variant-filled-primary self-end"
          disabled={loading || !newMemberHash}
        >
          {#if loading}
            <span class="loading loading-spinner loading-sm"></span>
          {:else}
            Add Member
          {/if}
        </button>
      </div>
    </form>

    <!-- Members Table -->
    <div class="card p-4">
      <OrganizationMembersTable {organization} />
    </div>
  </div>
</Modal>
