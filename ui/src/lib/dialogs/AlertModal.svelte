<script lang="ts">
  import type { AlertModalMeta } from '@lib/types';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();
  const { message } = $modalStore[0].meta as AlertModalMeta;
</script>

<article
  class="bg-surface-800 z-20 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-white shadow-xl md:w-4/5 lg:w-3/5"
>
  <div class="static space-y-10">
    <h2 class="h3 text-center">{message}</h2>
  </div>
</article>
