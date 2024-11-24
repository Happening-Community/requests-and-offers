<script lang="ts">
  import { page } from '$app/stores';
  import { Avatar, getModalStore } from '@skeletonlabs/skeleton';
  import type { UIOrganization, UIUser } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import usersStore from '@/stores/users.store.svelte';
  import type { ActionHash } from '@holochain/client';

  type Props = {
    organization: UIOrganization;
  };

  const { organization }: Props = $props();

  let members: UIUser[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function loadMembers() {
    try {
      loading = true;
      error = null;
      const memberHashes = await organizationsStore.getMemberUsers(organization);
      const loadedMembers = await Promise.all(
        memberHashes.map((user) => usersStore.getLatestUser(user.original_action_hash!))
      );
      members = loadedMembers.filter((user): user is UIUser => user !== null);
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  }

  async function handleRemoveMember(memberHash: ActionHash) {
    try {
      loading = true;
      error = null;
      await organizationsStore.removeMember(organization, memberHash);
      await loadMembers();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  }

  // Load members when the component mounts
  $effect(() => {
    if (organization) {
      loadMembers();
    }
  });
</script>

<div class="card p-4">
  <header class="card-header">
    <h3 class="h3">Organization Members</h3>
  </header>

  {#if error}
    <div class="alert variant-filled-error" role="alert">
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center p-4">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <table class="table-hover table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Name</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each members as member (member.original_action_hash)}
          <tr>
            <td>
              <Avatar
                src={member.picture
                  ? URL.createObjectURL(new Blob([new Uint8Array(member.picture)]))
                  : '/default_avatar.webp'}
                width="w-10"
                rounded="rounded-full"
              />
            </td>
            <td>{member.name}</td>
            <td>
              <span
                class="badge {organization.coordinators.includes(member.original_action_hash!)
                  ? 'variant-filled-primary'
                  : 'variant-filled-surface'}"
              >
                {organization.coordinators.includes(member.original_action_hash!)
                  ? 'Coordinator'
                  : 'Member'}
              </span>
            </td>
            <td>
              <div class="flex gap-2">
                {#if organization.coordinators.includes($page?.data?.user?.original_action_hash!)}
                  <button
                    class="btn btn-sm variant-filled-error"
                    onclick={() => handleRemoveMember(member.original_action_hash!)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if members.length === 0}
      <div class="text-surface-600-300-token flex justify-center p-4">No members found</div>
    {/if}
  {/if}
</div>
