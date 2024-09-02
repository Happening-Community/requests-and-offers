<script lang="ts">
  import moment from 'moment-timezone';
  import { FileDropzone, InputChip, Avatar } from '@skeletonlabs/skeleton';
  import usersStore, { type User, type UserType } from '@stores/users.svelte';
  import { goto } from '$app/navigation';
  import { createMockedUsers } from '@mocks';
  import { onMount } from 'svelte';

  type FormattedTimezone = {
    name: string;
    formatted: string;
    offset: number;
  };

  const { myProfile } = $derived(usersStore);

  let form: HTMLFormElement;
  let timezones = moment.tz.names();
  let userPicture: Blob | null = $state(null);
  let files: FileList | undefined = $state();
  let fileMessage: string = $state('');
  let filteredTimezones: string[] = $state([]);
  let formattedTimezones: FormattedTimezone[] = $state([]);
  let search = $state('');

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

  $effect(() => {
    search
      ? (formattedTimezones = formatTimezones(filteredTimezones))
      : (formattedTimezones = formatTimezones(timezones));
  });

  $effect(() => {
    formattedTimezones.sort((a, b) => {
      return a.offset - b.offset;
    });
  });

  function filterTimezones(event: any) {
    search = event.target.value.trim();
    filteredTimezones = timezones.filter((tz) => tz.toLowerCase().includes(search.toLowerCase()));
  }

  async function onPictureFileChange() {
    fileMessage = `${files![0].name}`;
    userPicture = new Blob([new Uint8Array(await files![0].arrayBuffer())]);
  }

  function RemoveUserPicture() {
    userPicture = null;
    fileMessage = '';
    const pictureInput = form.querySelector('input[name="picture"]') as HTMLInputElement;
    if (pictureInput) {
      pictureInput.value = '';
    }
  }

  async function mockUsers() {
    try {
      await usersStore.createUser((await createMockedUsers())[0]);
      await usersStore.getMyProfile();

      goto('/user');
    } catch (error) {
      console.error('error :', error);
    }
  }

  async function submitForm(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const picture = (await (data.get('picture') as File).arrayBuffer()) as Uint8Array;

    const user: User = {
      name: data.get('name') as string,
      nickname: data.get('nickname') as string,
      bio: data.get('bio') as string,
      picture: picture.byteLength > 0 ? new Uint8Array(picture) : undefined,
      user_type: data.get('user_type') as UserType,
      skills: data.getAll('skills') as string[],
      email: data.get('email') as string,
      phone: data.get('phone') as string,
      time_zone: data.get('timezone') as string,
      location: data.get('location') as string
    };

    try {
      await usersStore.createUser(user);
      await usersStore.getMyProfile();

      goto('/user');
    } catch (error) {
      console.error('error :', error);
    }
  }

  onMount(async () => {
    if (myProfile) {
      goto('/user');
    }
  });
</script>

<section class="flex w-4/5 flex-col gap-10 md:w-3/4 lg:w-1/2">
  <h2 class="h2">Create User Profile</h2>
  <form
    class="flex flex-col gap-4"
    enctype="multipart/form-data"
    onsubmit={submitForm}
    bind:this={form}
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
      <textarea class="textarea" name="bio"></textarea>
    </label>

    <p class="label text-lg">User picture :</p>
    <FileDropzone name="picture" bind:files onchange={onPictureFileChange} accept="image/*" />
    <div class="flex items-center justify-between">
      <p class="italic">{fileMessage}</p>
      {#if files && userPicture}
        <div>
          <Avatar src={URL.createObjectURL(userPicture)} />
          <button class="cursor-pointer underline" onclick={RemoveUserPicture}> Remove </button>
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-2 lg:flex-row lg:gap-6">
      <p class="label text-lg">Type* :</p>

      <div class="flex gap-4">
        <label class="label flex items-center gap-2">
          <input type="radio" name="user_type" value="advocate" checked required />
          Advocate
        </label>
        <label class="label flex items-center gap-2">
          <input type="radio" name="user_type" value="creator" required />
          Creator
        </label>
      </div>
    </div>

    <div class="flex flex-col gap-2 lg:flex-row lg:gap-6">
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
      <input type="email" class="input" name="email" required />
    </label>

    <label class="label text-lg">
      Phone number :
      <input type="text" class="input" name="phone" />
    </label>

    <label class="label text-lg">
      Time Zone :
      <!-- TODO: Use Autocomplete Skeleton component for timezone selection -->
      <input
        type="text"
        placeholder="Search timezones..."
        class="input w-1/2"
        oninput={filterTimezones}
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

    <div class="flex justify-around">
      <button type="submit" class="btn variant-filled-primary w-fit self-center">
        Create Profile
      </button>

      <button
        type="button"
        class="btn variant-filled-tertiary w-fit self-center"
        onclick={mockUsers}
      >
        Create Mocked User
      </button>
    </div>
  </form>
</section>
