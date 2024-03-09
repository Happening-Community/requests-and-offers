<script lang="ts">
  import moment from 'moment-timezone';
  import { FileDropzone, InputChip } from '@skeletonlabs/skeleton';
  import {
    createProfile,
    myProfile,
    getMyProfileZomeCall,
    type IndividualType,
    type Profile
  } from '@stores/profiles.store.js';
  import { goto } from '$app/navigation';

  type FormattedTimezone = {
    name: string;
    formatted: string;
    offset: number;
  };

  let files: FileList;
  let fileMessage: HTMLParagraphElement;
  let timezones = moment.tz.names();
  let filteredTimezones: string[] = [];
  let formattedTimezones: FormattedTimezone[] = [];
  let search = '';

  function formatTimezones(timezones: string[]): FormattedTimezone[] {
    return timezones.map((timezone) => {
      const offset = moment.tz(timezone).utcOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';

      const formatted = `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${timezone}`;

      return {
        name: timezone,
        formatted,
        offset
      };
    });
  }

  $: search
    ? (formattedTimezones = formatTimezones(filteredTimezones).sort((a, b) => a.offset - b.offset))
    : (formattedTimezones = formatTimezones(timezones)).sort((a, b) => a.offset - b.offset);

  function filterTimezones(event: any) {
    search = event.target.value.trim();
    filteredTimezones = timezones.filter((tz) => tz.toLowerCase().includes(search.toLowerCase()));
  }

  function onPictureFileChange() {
    fileMessage.innerHTML = `${files[0].name}`;
  }

  async function submitForm(event: SubmitEvent) {
    event.preventDefault();
    console.log('event :', event);

    const data = new FormData(event.target as HTMLFormElement);
    const profile_picture = (await (data.get('picture') as File).arrayBuffer()) as Uint8Array;

    const profile: Profile = {
      name: data.get('name') as string,
      nickname: data.get('nickname') as string,
      bio: data.get('bio') as string,
      profile_picture: profile_picture.byteLength > 0 ? new Uint8Array(profile_picture) : undefined,
      individual_type: data.get('individual_type') as IndividualType,
      skills: data.getAll('skills') as string[],
      email: data.get('email') as string,
      phone: data.get('phone') as string,
      time_zone: data.get('timezone') as string,
      location: data.get('location') as string,
      created_at: 0
    };

    console.log('profile :', profile);

    try {
      await createProfile(profile);
      await getMyProfileZomeCall();

      goto('/profile');
    } catch (error) {
      console.log('error :', error);
    }
  }
</script>

<section class="flex w-1/2 flex-col gap-10">
  {#if $myProfile}
    <p class="h2">Profile already created.</p>
    <!-- {:else if form?.success}
    <h2 class="h2 text-center text-green-500">Profile Created successfully.</h2> -->
  {:else}
    <h2 class="h2">Create Profile</h2>
    <!-- {#if form?.success === false}
      <p class="text-red-500">An error occured</p>
    {/if} -->
    <form
      id="form"
      class="flex flex-col gap-4"
      enctype="multipart/form-data"
      on:submit={submitForm}
    >
      <p>*required fields</p>
      <label class="label text-lg">
        Name* :<input type="text" class="input" name="name" required />
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
      <FileDropzone name="picture" bind:files on:change={onPictureFileChange} accept="image/*" />
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
        <input
          type="text"
          placeholder="Search timezones..."
          class="input w-1/2"
          on:input={filterTimezones}
        />
        <select name="timezone" id="timezone" class="select">
          {#each formattedTimezones as tz}
            <option class="" value={tz.name}>{tz.formatted}</option>
          {/each}
        </select>
      </label>

      <label class="label text-lg">
        Location :
        <input type="text" class="input" name="location" />
      </label>

      <button type="submit" class="btn variant-filled-primary w-fit self-center">Submit</button>
    </form>
  {/if}
</section>
