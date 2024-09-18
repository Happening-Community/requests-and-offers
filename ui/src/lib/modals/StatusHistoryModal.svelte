<script>
  import StatusTable from '@lib/tables/StatusTable.svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();
  const username = $modalStore[0].meta.statusHistory[0].user.name;
</script>

<article class="hcron-modal">
  <div class="static mb-8 space-y-10">
    <h2 class="h2 text-center">
      Status History for {username}
    </h2>

    <StatusTable statusHistory={$modalStore[0].meta.statusHistory} />
  </div>

  <button
    class="btn variant-filled-secondary w-fit self-center"
    on:click={() => modalStore.close()}
  >
    Close
  </button>
</article>
