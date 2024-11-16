<script>
  import StatusTable from '@lib/tables/StatusTable.svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  const modalStore = getModalStore();

  onMount(() => {
    console.log('modalStore', $modalStore);
  });

  const statusHistory = $modalStore[0]?.meta?.statusHistory || [];
  const username = $modalStore[0]?.meta?.username;
</script>

<article class="hcron-modal">
  <div class="static mb-8 space-y-10">
    <h2 class="h2 text-center">{username}</h2>

    <StatusTable {statusHistory} {username} />
  </div>

  <button
    class="btn variant-filled-secondary w-fit self-center"
    on:click={() => modalStore.close()}
  >
    Close
  </button>
</article>
