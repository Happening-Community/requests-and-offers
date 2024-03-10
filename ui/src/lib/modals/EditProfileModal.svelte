<script lang="ts">
  import { FileDropzone, InputChip, getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();

  export let parent: any;

  let files: FileList;
  let fileMessage: HTMLParagraphElement;

  const profile = $modalStore[0].meta.profile;

  function onPictureFileChange() {
    fileMessage.innerHTML = `${files[0].name}`;
  }

  function submitForm(event: SubmitEvent) {
    console.log('event :', event);
  }
</script>

<article class="card w-fit overflow-auto bg-slate-800 p-10 text-white shadow-xl">
  <header class="h3 mb-4 text-center">Edit your profile</header>
</article>
