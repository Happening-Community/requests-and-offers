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

<article class="card w-72 w-fit overflow-auto bg-slate-800 p-4 text-white shadow-xl">
  <header class="h3 mb-4 text-center">Edit your profile</header>
  <form id="form" class="flex flex-col gap-4" enctype="multipart/form-data" on:submit={submitForm}>
    <p>*required fields</p>
    <label class="label text-lg">
      Name* :<input type="text" class="input" name="name" value={profile.name} required />
    </label>

    <label class="label text-lg">
      Nickname* :
      <input type="text" class="input" name="nickname" required />
    </label>

    <label class="label text-lg">
      Bio :
      <textarea class="textarea" name="bio" />
    </label>

    <p class="label text-lg">Profile picture :</p>
    <FileDropzone
      name="picture"
      bind:files
      on:change={onPictureFileChange}
      accept="image/*"
      regionInterfaceText="text-black"
    />
    <p class="italic" bind:this={fileMessage} />

    <div class="flex gap-6">
      <p class="label text-lg">Type* :</p>

      <div class="flex gap-4">
        <label class="label flex items-center gap-2">
          <input type="radio" name="individual_type" value="advocate" required />
          Advocate
        </label>
        <label class="label flex items-center gap-2">
          <input type="radio" name="individual_type" value="developer" />
          Developer
        </label>
      </div>
    </div>

    <div class="flex gap-5">
      <p class="label w-16 text-lg">Skills :</p>
      <!-- TODO:When skills indexation done, use Autocomplete Input Chip Skeleton component for skills selection -->
      <InputChip
        id="skills"
        name="skills"
        placeholder="Write a skill and press enter"
        chips="variant-filled-secondary"
      />
    </div>

    <label class="label text-lg">
      Email* :
      <input type="email" class="input" name="email" />
    </label>

    <label class="label text-lg">
      Phone number :
      <input type="text" class="input" name="phone" />
    </label>

    <label class="label text-lg">
      Time Zone :
      <!-- TODO: Use Autocomplete Skeleton compunent for timezone selection -->
      <!-- <input
      type="text"
      placeholder="Search timezones..."
      class="input w-1/2"
      on:input={filterTimezones}
    />
    <select name="timezone" id="timezone" class="select">
      {#each formattedTimezones as tz}
        <option class="" value={tz.name}>{tz.formatted}</option>
      {/each}
    </select> -->
    </label>

    <label class="label text-lg">
      Location :
      <input type="text" class="input" name="location" />
    </label>

    <button type="submit" class="btn variant-filled-primary w-fit self-center">Submit</button>
  </form>
</article>

<style>
  .input,
  .textarea {
    @apply text-black;
  }
</style>
