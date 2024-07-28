<script lang="ts">
  import {
    Avatar,
    ConicGradient,
    getModalStore,
    type ConicStop,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import { getAllProfiles, profiles, type Profile } from '@stores/profiles.store';
  import { onMount } from 'svelte';
  import ProfileDetailsModal from '@lib/modals/ProfileDetailsModal.svelte';

  $: isLoading = true;

  $: pendingProfiles = $profiles.filter((profile) => profile.status === 'pending');
  $: acceptedProfiles = $profiles.filter((profile) => profile.status === 'accepted');
  $: rejectedProfiles = $profiles.filter((profile) => profile.status === 'rejected');
  $: temporarilySuspendedProfiles = $profiles
    .filter((profile) => profile.status!.split(' ').length > 1)
    .filter((profile) => profile.remaining_time)
    .sort((a, b) => a.remaining_time! - b.remaining_time!);
  $: indefinitelySuspendedProfiles = $profiles.filter((profile) => profile.status === 'suspended');

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: ProfileDetailsModal };
  const modal = (profile: Profile): ModalSettings => {
    return {
      type: 'component',
      component: modalComponent,
      meta: {
        profile
      }
    };
  };

  onMount(async () => {
    await getAllProfiles();

    isLoading = false;
  });

  function formatRemainingTimeInDays(remainingTime: number): string {
    const days = Math.floor(remainingTime / 1000 / 60 / 60 / 24);
    const hours = Math.floor((remainingTime / 1000 / 60 / 60) % 24);

    return `${days}d ${hours}h`;
  }
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Persons management</h1>
  {#if isLoading && $profiles.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
  <div class="flex flex-col gap-4 lg:flex-row lg:justify-center lg:gap-0 lg:divide-x-2">
    <div class="flex flex-col gap-4 lg:pr-4">
      <h2 class="h3 text-primary-400">Pending persons</h2>
      {#if pendingProfiles && pendingProfiles.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each pendingProfiles as profile, i}
              <tr>
                <td>
                  <Avatar
                    src={profile.picture
                      ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
                      : '/default_avatar.webp'}
                  />
                </td>
                <td>{profile.name}</td>
                <td>
                  {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
                </td>
                <td>
                  <button
                    class="btn variant-filled-secondary"
                    on:click={() => modalStore.trigger(modal(profile))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No pending profiles</p>
      {/if}
    </div>
    <div class="flex flex-col gap-4 lg:pl-4">
      <h2 class="h3 text-green-600">Accepted persons</h2>
      {#if acceptedProfiles && acceptedProfiles.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each acceptedProfiles as profile, i}
              <tr>
                <td>
                  <Avatar
                    src={profile.picture
                      ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
                      : '/default_avatar.webp'}
                  />
                </td>
                <td>{profile.name}</td>
                <td>
                  {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
                </td>
                <td>
                  <button
                    class="btn variant-filled-secondary"
                    on:click={() => modalStore.trigger(modal(profile))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No accepted profiles</p>
      {/if}
    </div>
  </div>

  <details open class="flex flex-col gap-4">
    <summary class="mb-4 flex cursor-pointer gap-2 text-red-600">
      <h2 class="h3">Suspended persons</h2>
      <span>
        ({temporarilySuspendedProfiles?.length + indefinitelySuspendedProfiles?.length}) ⮟
      </span>
    </summary>
    <div class="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:divide-x-2">
      {#if temporarilySuspendedProfiles && temporarilySuspendedProfiles.length > 0}
        <div class="space-y-2 lg:pr-4">
          <h2 class="h3">Temporarily suspended</h2>

          <table class="table-hover table drop-shadow-lg">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Type</th>
                <th>Remaining time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each temporarilySuspendedProfiles as profile, i}
                <tr>
                  <td>
                    <Avatar
                      src={profile.picture
                        ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
                        : '/default_avatar.webp'}
                    />
                  </td>
                  <td>{profile.name}</td>
                  <td>
                    {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
                  </td>
                  <td class="text-center">
                    {#if profile.remaining_time}
                      {#if profile.remaining_time <= 0}
                        <span class="font-bold text-red-600">expired</span>
                      {:else}
                        {formatRemainingTimeInDays(profile.remaining_time)}
                      {/if}
                    {/if}
                  </td>
                  <td>
                    <button
                      class="btn variant-filled-secondary"
                      on:click={() => modalStore.trigger(modal(profile))}
                    >
                      View
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
      {#if indefinitelySuspendedProfiles && indefinitelySuspendedProfiles.length > 0}
        <div class="space-y-2 lg:pl-4">
          <h2 class="h3">Indefinitely suspended</h2>

          <table class="table-hover table drop-shadow-lg">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each indefinitelySuspendedProfiles as profile, i}
                <tr>
                  <td>
                    <Avatar
                      src={profile.picture
                        ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
                        : '/default_avatar.webp'}
                    />
                  </td>
                  <td>{profile.name}</td>
                  <td>
                    {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
                  </td>
                  <td>
                    <button
                      class="btn variant-filled-secondary"
                      on:click={() => modalStore.trigger(modal(profile))}
                    >
                      View
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
      {#if !temporarilySuspendedProfiles && !indefinitelySuspendedProfiles}
        <p>No suspended profiles</p>
      {/if}
    </div>
  </details>

  <details>
    <summary class="mb-4 flex cursor-pointer gap-2 text-red-600">
      <h2 class="h3">Rejected persons</h2>
      <span>({rejectedProfiles?.length}) ⮟</span>
    </summary>
    <div class="flex flex-col gap-4">
      {#if rejectedProfiles && rejectedProfiles.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each rejectedProfiles as profile, i}
              <tr>
                <td>
                  <Avatar
                    src={profile.picture
                      ? URL.createObjectURL(new Blob([new Uint8Array(profile.picture)]))
                      : '/default_avatar.webp'}
                  />
                </td>
                <td>{profile.name}</td>
                <td>
                  {profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
                </td>
                <td>
                  <button
                    class="btn variant-filled-secondary"
                    on:click={() => modalStore.trigger(modal(profile))}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No rejected profiles</p>
      {/if}
    </div>
  </details>
</section>
