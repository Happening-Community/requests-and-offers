<script lang="ts">
import { createEventDispatcher, onMount, getContext } from 'svelte';
import '@material/mwc-circular-progress';
import { decode } from '@msgpack/msgpack';
import type { Record, ActionHash, AppAgentClient, EntryHash, AgentPubKey, DnaHash } from '@holochain/client';
import { clientContext } from '../../contexts';
import type { IndiviualProfile } from './types';
import '@material/mwc-circular-progress';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-snackbar';
import '@material/mwc-icon-button';
import EditIndiviualProfile from './EditIndiviualProfile.svelte'; 

const dispatch = createEventDispatcher();

export let indiviualProfileHash: ActionHash;

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

let loading = true;
let error: any = undefined;

let record: Record | undefined;
let indiviualProfile: IndiviualProfile | undefined;

let editing = false;

let errorSnackbar: Snackbar;
  
$: editing,  error, loading, record, indiviualProfile;

onMount(async () => {
  if (indiviualProfileHash === undefined) {
    throw new Error(`The indiviualProfileHash input is required for the IndiviualProfileDetail element`);
  }
  await fetchIndiviualProfile();
});

async function fetchIndiviualProfile() {
  loading = true;
  error = undefined;
  record = undefined;
  indiviualProfile = undefined;
  
  try {
    record = await client.callZome({
      cap_secret: null,
      role_name: 'requests_and_offers',
      zome_name: 'profiles',
      fn_name: 'get_indiviual_profile',
      payload: indiviualProfileHash,
    });
    if (record) {
      indiviualProfile = decode((record.entry as any).Present.entry) as IndiviualProfile;
    }
  } catch (e) {
    error = e;
  }

  loading = false;
}

async function deleteIndiviualProfile() {
  try {
    await client.callZome({
      cap_secret: null,
      role_name: 'requests_and_offers',
      zome_name: 'profiles',
      fn_name: 'delete_indiviual_profile',
      payload: indiviualProfileHash,
    });
    dispatch('indiviual-profile-deleted', { indiviualProfileHash: indiviualProfileHash });
  } catch (e: any) {
    errorSnackbar.labelText = `Error deleting the indiviual profile: ${e.data.data}`;
    errorSnackbar.show();
  }
}
</script>

<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>

{#if loading}
<div style="display: flex; flex: 1; align-items: center; justify-content: center">
  <mwc-circular-progress indeterminate></mwc-circular-progress>
</div>
{:else if error}
<span>Error fetching the indiviual profile: {error.data.data}</span>
{:else if editing}
<EditIndiviualProfile
  originalIndiviualProfileHash={ indiviualProfileHash}
  currentRecord={record}
  on:indiviual-profile-updated={async () => {
    editing = false;
    await fetchIndiviualProfile()
  } }
  on:edit-canceled={() => { editing = false; } }
></EditIndiviualProfile>
{:else}

<div style="display: flex; flex-direction: column">
  <div style="display: flex; flex-direction: row">
    <span style="flex: 1"></span>
    <mwc-icon-button style="margin-left: 8px" icon="edit" on:click={() => { editing = true; } }></mwc-icon-button>
    <mwc-icon-button style="margin-left: 8px" icon="delete" on:click={() => deleteIndiviualProfile()}></mwc-icon-button>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Name:</strong></span>
    <span style="white-space: pre-line">{ indiviualProfile.name }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Nickname:</strong></span>
    <span style="white-space: pre-line">{ indiviualProfile.nickname }</span>
  </div>

  <div style="display: flex; flex-direction: row; margin-bottom: 16px">
    <span style="margin-right: 4px"><strong>Bio:</strong></span>
    <span style="white-space: pre-line">{ indiviualProfile.bio }</span>
  </div>

</div>
{/if}

