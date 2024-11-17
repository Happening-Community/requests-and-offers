<script lang="ts">
  import usersStore from '@/stores/users.store.svelte';

  let isLoading = $state(true);
  let error: string | null = $state(null);
  let requests: any[] = $state([]);

  const { currentUser } = $derived(usersStore);

  async function fetchRequests() {
    try {
      isLoading = true;
      error = null;

      requests = [];
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      error = err instanceof Error ? err.message : 'Failed to load requests';
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    fetchRequests();
  });
</script>

<section class="container mx-auto p-4">
  <h1 class="h1 mb-6 text-center">Requests</h1>

  {#if error}
    <div class="alert variant-filled-error mb-4">
      <p>{error}</p>
      <button
        class="btn btn-sm variant-soft"
        onclick={() => {
          error = null;
          fetchRequests();
        }}
      >
        Retry
      </button>
    </div>
  {/if}

  {#if isLoading}
    <div class="flex h-64 items-center justify-center">
      <span class="loading loading-spinner text-primary"></span>
      <p class="ml-4">Loading requests...</p>
    </div>
  {:else if requests.length === 0}
    <div class="text-surface-500 text-center text-xl">
      {#if currentUser}
        No requests found. Create your first request!
      {:else}
        Please log in to view requests.
      {/if}
    </div>
  {:else}
    <div class="grid gap-4">
      {#each requests as request}
        <div class="card variant-soft p-4">
          <p>Request details will be added soon</p>
        </div>
      {/each}
    </div>
  {/if}
</section>
