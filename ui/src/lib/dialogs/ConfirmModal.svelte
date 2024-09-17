<script lang="ts">
  import type { ConfirmModalMeta } from '@lib/types';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();
  const { message, confirmLabel, cancelLabel } = $modalStore[0].meta as ConfirmModalMeta;

  function confirm() {
    $modalStore[0].response!(true);
    modalStore.close();
  }

  function cancel() {
    $modalStore[0].response!(false);
    modalStore.close();
  }
</script>

<article
  class="bg-surface-800 z-20 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-white shadow-xl md:w-4/5 lg:w-3/5"
>
  <div class="static space-y-10">
    <h2 class="h3 text-center">{message}</h2>
    <div class="flex justify-center gap-4">
      <button class="btn variant-filled-tertiary w-fit self-center" onclick={confirm}
        >{confirmLabel || 'Yes'}</button
      >
      <button type="button" class="btn variant-filled-error w-fit self-center" onclick={cancel}
        >{cancelLabel || 'No'}</button
      >
    </div>
  </div>
</article>
