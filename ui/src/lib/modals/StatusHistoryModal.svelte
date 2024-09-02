<script>
  import StatusTable from '@lib/tables/StatusTable.svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();
  const username = $modalStore[0].meta.statusHistory[0].user.name;
</script>

<article
  class="bg-surface-800 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-white shadow-xl md:w-4/5 lg:w-3/5"
>
  <div class="static mb-8 space-y-10">
    <h2 class="h2 text-center">
      Status History for {username}
    </h2>

    <StatusTable statusHistory={$modalStore[0].meta.statusHistory} />
  </div>
</article>
