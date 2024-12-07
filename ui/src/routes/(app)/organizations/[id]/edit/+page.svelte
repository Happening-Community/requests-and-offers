<script lang="ts">
  import { page } from '$app/stores';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { FileDropzone } from '@skeletonlabs/skeleton';
  import { goto } from '$app/navigation';
  import type { UIOrganization } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import { decodeHashFromBase64, type ActionHash } from '@holochain/client';

  const toastStore = getToastStore();
  const organizationHash = decodeHashFromBase64($page.params.id) as ActionHash;

  let organization: UIOrganization | null = $state(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Form state
  let formName = $state('');
  let formDescription = $state('');
  let formEmail = $state('');
  let formLocation = $state('');
  let formUrls = $state('');

  // Logo state
  let organizationLogo: File | null = $state(null);
  let logoFiles: FileList | undefined = $state();
  let logoFileMessage: string = $state('');

  // Update form values when organization changes
  $effect(() => {
    if (organization) {
      formName = organization.name;
      formDescription = organization.description;
      formEmail = organization.email;
      formLocation = organization.location;
      formUrls = organization.urls.join(', ');
    }
  });

  // Update logo when organization changes
  $effect(() => {
    if (organization?.logo) {
      organizationLogo = new File([organization.logo], 'organizationLogo');
    }
  });

  function handleLogoUpload() {
    if (logoFiles && logoFiles.length > 0) {
      organizationLogo = logoFiles[0] as File;
      logoFileMessage = `Selected file: ${organizationLogo.name}`;
    } else {
      logoFileMessage = 'No file selected';
    }
  }

  async function handleUpdateSettings(event: Event) {
    event.preventDefault();
    if (!organization) return;

    try {
      loading = true;

      // Parse URLs from comma-separated string
      const urls = formUrls
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);

      // Create update object
      const updates = {
        name: formName,
        description: formDescription,
        email: formEmail,
        location: formLocation,
        urls,
        ...(organizationLogo
          ? { logo: new Uint8Array(await organizationLogo.arrayBuffer()) }
          : organization.logo)
      };

      // Update organization
      if (!organization.original_action_hash) {
        throw new Error('Organization action hash not found');
      }

      const updatedOrganization = await organizationsStore.updateOrganization(
        organization.original_action_hash,
        updates
      );

      if (!updatedOrganization) {
        throw new Error('Failed to update organization');
      }

      toastStore.trigger({
        message: 'Organization updated successfully',
        background: 'variant-filled-success'
      });

      // Navigate back to organization page
      goto(`/organizations/${$page.params.id}`);
    } catch (e) {
      console.error('Error updating organization:', e);
      toastStore.trigger({
        message: 'Failed to update organization',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

  async function handleDeleteOrganization() {
    if (!organization?.original_action_hash) return;

    try {
      loading = true;
      await organizationsStore.deleteOrganization(organization.original_action_hash);

      toastStore.trigger({
        message: 'Organization deleted successfully',
        background: 'variant-filled-success'
      });

      goto('/organizations');
    } catch (e) {
      console.error('Error deleting organization:', e);
      toastStore.trigger({
        message: 'Failed to delete organization',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

  // Load organization when the component mounts
  $effect(() => {
    if (organizationHash) {
      loadOrganization();
    }
  });

  async function loadOrganization() {
    try {
      loading = true;
      error = null;
      organization = await organizationsStore.getLatestOrganization(organizationHash);
    } catch (e) {
      console.error('Error loading organization:', e);
      error = 'Failed to load organization';
    } finally {
      loading = false;
    }
  }
</script>

<div class="container mx-auto max-w-3xl py-8">
  {#if error}
    <div class="alert variant-filled-error" role="alert">
      <p>{error}</p>
      <button class="btn btn-sm variant-soft" onclick={loadOrganization}>Try Again</button>
    </div>
  {:else if loading && !organization}
    <div class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if organization}
    <div class="card w-full p-6">
      <header class="mb-4">
        <div class="flex items-center justify-between">
          <h2 class="h2">Edit Organization</h2>
          <button
            class="btn variant-ghost-surface"
            onclick={() => goto(`/organizations/${$page.params.id}`)}
          >
            Cancel
          </button>
        </div>
      </header>

      <form onsubmit={handleUpdateSettings} class="space-y-4">
        <label class="label">
          <span>Name</span>
          <input class="input" type="text" name="name" bind:value={formName} required />
        </label>

        <label class="label">
          <span>Description</span>
          <textarea
            class="textarea"
            name="description"
            rows="3"
            bind:value={formDescription}
            required
          ></textarea>
        </label>

        <label class="label">
          <span>Email</span>
          <input class="input" type="email" name="email" bind:value={formEmail} required />
        </label>

        <label class="label">
          <span>Location</span>
          <input class="input" type="text" name="location" bind:value={formLocation} required />
        </label>

        <label class="label">
          <span>URLs (comma-separated)</span>
          <input class="input" type="text" name="urls" bind:value={formUrls} />
        </label>

        <!-- Organization Logo Upload -->
        <div class="form-group">
          <label for="organization-logo" class="form-label">Organization Logo</label>
          <FileDropzone bind:files={logoFiles} on:change={handleLogoUpload} name="logo" />
          <p class="file-message">{logoFileMessage}</p>
        </div>

        <div class="flex gap-4">
          <button type="submit" class="btn variant-filled-primary" disabled={loading}>
            {#if loading}
              <span class="loading loading-spinner loading-sm"></span>
            {/if}
            Save Changes
          </button>

          <button
            type="button"
            class="btn variant-filled-error"
            onclick={handleDeleteOrganization}
            disabled={loading}
          >
            {#if loading}
              <span class="loading loading-spinner loading-sm"></span>
            {/if}
            Delete Organization
          </button>
        </div>
      </form>
    </div>
  {:else}
    <div class="flex justify-center p-8">
      <p class="text-surface-600-300-token">Organization not found</p>
    </div>
  {/if}
</div>
