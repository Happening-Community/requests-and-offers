<script lang="ts">
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();
  const { message, inputs } = $modalStore[0].meta as PromptModalMeta;
  let { confirmText } = $modalStore[0].meta as PromptModalMeta;

  let form: HTMLFormElement;

  function submitForm(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);

    if (confirmText) {
      const confirmation = confirm(confirmText);
      if (!confirmation) {
        form.reset();
        return;
      }
    }

    $modalStore[0].response!({ data });
    modalStore.close();
  }
</script>

<article
  class="bg-surface-800 z-20 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-white shadow-xl md:w-4/5 lg:w-3/5"
>
  <div class="static space-y-4">
    <h2 class="h2 text-center">{message}</h2>
    <form class="space-y-10" onsubmit={submitForm} bind:this={form}>
      {#each inputs as input}
        <label>
          {input.label}:
          <input
            type={input.type}
            placeholder={input.placeholder}
            class="input"
            name={input.name}
            value={input.value}
            min={input.min}
            max={input.max}
          />
        </label>
      {/each}
      <div class="flex justify-center gap-4">
        <button type="submit" class="btn variant-filled-tertiary w-fit self-center">Submit</button>
        <button
          type="button"
          class="btn variant-filled-error w-fit self-center"
          onclick={() => modalStore.close()}>Cancel</button
        >
      </div>
    </form>
  </div>
</article>
