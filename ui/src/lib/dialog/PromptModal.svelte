<script lang="ts">
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();
  const { message, inputs } = $modalStore[0].meta as PromptModalMeta;

  console.log($modalStore[0].meta);
  console.log(message, inputs);

  function submitForm(event: SubmitEvent) {
    event.preventDefault();
    const confirmation = confirm('Are you sure you want to suspend this user for x days ?');
    if (!confirmation) return;
    const data = new FormData(event.target as HTMLFormElement);
    $modalStore[0].response!({ data });
    modalStore.close();
  }
</script>

<article
  class="bg-surface-800 z-20 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-white shadow-xl md:w-4/5 lg:w-3/5"
>
  <div class="static mb-8 space-y-4">
    <h2 class="h2 text-center">{message}</h2>
    <form class="space-y-4" onsubmit={submitForm}>
      {#each inputs as input}
        <label>
          {input.label}:
          <input
            type={input.type}
            placeholder={input.placeholder}
            class="input"
            name={input.name}
            value={input.value}
            required={input.required}
          />
        </label>
      {/each}
      <div class="space-x-4">
        <button type="submit" class="btn variant-filled-tertiary w-fit self-center">Submit</button>
        <button
          class="btn variant-filled-error w-fit self-center"
          onclick={() => modalStore.close()}>Cancel</button
        >
      </div>
    </form>
  </div>
</article>
