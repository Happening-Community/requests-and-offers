<script lang="ts">
  import moment from 'moment-timezone';
  import { Avatar, FileDropzone, InputChip } from '@skeletonlabs/skeleton';
  import {
    myProfile,
    type UserType,
    type Profile,
    updateMyProfile,
    getMyProfile
  } from '@stores/profiles.store.js';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import NavButton from '@lib/NavButton.svelte';

  type FormattedTimezone = {
    name: string;
    formatted: string;
    offset: number;
  };

  let form: HTMLFormElement;
  let files: FileList;
  let fileMessage: HTMLParagraphElement;
  let profilePicture: Blob | undefined;
  let timezones = moment.tz.names();
  let filteredTimezones: string[] = [];
  let formattedTimezones: FormattedTimezone[] = [];
  let search = '';
  let isChanged = false;

  $: console.log('isChanged :', isChanged);

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

  async function onPictureFileChange() {
    fileMessage.innerHTML = `${files[0].name}`;
    profilePicture = new Blob([new Uint8Array(await files[0].arrayBuffer())]);
  }

  function RemoveProfilePicture() {
    isChanged = true;
    profilePicture = undefined;
    fileMessage.innerHTML = '';
    const pictureInput = form.querySelector('input[name="picture"]') as HTMLInputElement;
    if (pictureInput) {
      pictureInput.value = '';
    }

    myProfile.update((profile) => {
      if (!profile) return null;
      return {
        ...profile,
        picture: undefined
      };
    });
  }

  onMount(async () => {
    if ($myProfile?.picture) profilePicture = new Blob([$myProfile?.picture]);
  });

  async function submitForm(event: SubmitEvent) {
    event.preventDefault();
    console.log('event :', event);

    const data = new FormData(form);
    const picture = (await (data.get('picture') as File).arrayBuffer()) as Uint8Array;

    console.log(data.get('picture'));

    const profile: Profile = {
      name: data.get('name') as string,
      nickname: data.get('nickname') as string,
      bio: data.get('bio') as string,
      picture: picture.byteLength > 0 ? new Uint8Array(picture) : $myProfile?.picture,
      user_type: data.get('user_type') as UserType,
      skills: data.getAll('skills') as string[],
      email: data.get('email') as string,
      phone: data.get('phone') as string,
      time_zone: data.get('timezone') as string,
      location: data.get('location') as string
    };

    try {
      await updateMyProfile(profile);
      await getMyProfile();

      goto('/profile');
    } catch (error) {
      console.log('error :', error);
    }
  }
</script>

<section class="flex w-1/2 flex-col gap-10">
  {#if !$myProfile}
    <p class="mb-4 text-center text-xl">It looks like you don't have a profile yet !</p>
    <NavButton href="/profile/create" text="Create profile" />
  {:else}
    <h2 class="h2">Edit Profile</h2>

    <form
      class="flex flex-col gap-4"
      enctype="multipart/form-data"
      bind:this={form}
      on:submit={submitForm}
      on:input={() => (isChanged = true)}
    >
      <p>*required fields</p>
      <label class="label text-lg">
        Name* :<input type="text" class="input" name="name" value={$myProfile.name} required />
      </label>

      <label class="label text-lg">
        Nickname* :
        <input type="text" class="input" name="nickname" value={$myProfile.nickname} required />
      </label>

      <label class="label text-lg">
        Bio :
        <textarea class="textarea" name="bio" value={$myProfile.bio} />
      </label>

      <p class="label text-lg">Profile picture :</p>
      <FileDropzone name="picture" bind:files on:change={onPictureFileChange} accept="image/*" />
      <div class="flex items-center justify-between">
        <p class="italic" bind:this={fileMessage} />
        {#if files && profilePicture}
          <div>
            <Avatar src={URL.createObjectURL(profilePicture)} />
            <button class="cursor-pointer underline" on:click={RemoveProfilePicture}>
              Remove
            </button>
          </div>
        {/if}
      </div>

      {#if profilePicture && !files}
        <div class="flex items-center gap-2">
          <Avatar src={URL.createObjectURL(profilePicture)} />
          <button class="cursor-pointer underline" on:click={RemoveProfilePicture}> Remove </button>
        </div>
      {/if}

      <div class="flex gap-6">
        <p class="label text-lg">Type* :</p>

        <div class="flex gap-4">
          <label class="label flex items-center gap-2">
            <input
              type="radio"
              name="user_type"
              value="advocate"
              checked={$myProfile.user_type === 'advocate'}
              required
            />
            Advocate
          </label>
          <label class="label flex items-center gap-2">
            <input
              type="radio"
              name="user_type"
              value="creator"
              checked={$myProfile.user_type === 'creator'}
              required
            />
            Creator
          </label>
        </div>
      </div>

      <div class="flex gap-2">
        <p class="label w-16 text-lg">Skills :</p>
        <!-- TODO:When skills indexation done, use Autocomplete Input Chip Skeleton component for skills selection -->
        <InputChip
          id="skills"
          value={$myProfile.skills}
          name="skills"
          placeholder="Write a skill and press enter"
          chips="variant-filled-secondary"
        />
      </div>

      <label class="label text-lg">
        Email* :
        <input type="email" class="input" name="email" value={$myProfile.email} required />
      </label>

      <label class="label text-lg">
        Phone number :
        <input type="text" class="input" name="phone" value={$myProfile.phone} />
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
            <option class="" value={tz.name} selected={tz.name === $myProfile.time_zone}>
              {tz.formatted}
            </option>
          {/each}
        </select>
      </label>

      <label class="label text-lg">
        Location :
        <input type="text" class="input" name="location" value={$myProfile.location} />
      </label>

      <button
        type="submit"
        class="btn variant-filled-primary w-fit self-center"
        disabled={!isChanged}
      >
        Update Profile
      </button>
    </form>
  {/if}
</section>
