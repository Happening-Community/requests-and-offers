<script lang="ts">
  import usersStore from '@/stores/users.store.svelte';

  let isLoading = $state(true);
  let error: string | null = $state(null);
  let offers: any[] = $state([]);

  const { currentUser } = $derived(usersStore);

  async function fetchOffers() {
    try {
      isLoading = true;
      error = null;

      // Placeholder for future offer fetching logic
      offers = [];
    } catch (err) {
      console.error('Failed to fetch offers:', err);
      error = err instanceof Error ? err.message : 'Failed to load offers';
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    fetchOffers();
  });
</script>

<section class="container mx-auto p-4">
  <h1 class="h1 mb-6 text-center">Offers Management</h1>

  {#if error}
    <div class="alert variant-filled-error mb-4">
      <p>{error}</p>
      <button
        class="btn btn-sm variant-soft"
        onclick={() => {
          error = null;
          fetchOffers();
        }}
      >
        Retry
      </button>
    </div>
  {/if}

  {#if isLoading}
    <div class="flex h-64 items-center justify-center">
      <span class="loading loading-spinner text-primary"></span>
      <p class="ml-4">Loading offers...</p>
    </div>
  {:else if offers.length === 0}
    <div class="text-surface-500 text-center text-xl">
      {#if currentUser}
        No offers found. Create your first offer!
      {:else}
        Please log in to view offers.
      {/if}
    </div>
  {:else}
    <div class="grid gap-4">
      {#each offers as offer}
        <div class="card variant-soft p-4">
          <p>Offer details will be added soon</p>
        </div>
      {/each}
    </div>
  {/if}
</section>
