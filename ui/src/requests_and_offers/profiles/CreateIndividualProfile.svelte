<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import type {
    AppAgentClient,
    Record,
    EntryHash,
    AgentPubKey,
    ActionHash,
    DnaHash,
  } from "@holochain/client";
  import { clientContext } from "../../contexts";
  import type { IndividualProfile } from "./types";
  import "@material/mwc-button";
  import "@material/mwc-snackbar";
  import type { Snackbar } from "@material/mwc-snackbar";
  import "@material/mwc-textfield";

  import "@material/mwc-textarea";
  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  const dispatch = createEventDispatcher();

  let name: string = "";
  let nickname: string = "";
  let bio: string = "";

  let errorSnackbar: Snackbar;

  $: name, nickname, bio;
  $: isIndividualProfileValid =
    true && name !== "" && nickname !== "" && bio !== "";

  onMount(() => {});

  async function createIndividualProfile() {
    const IndividualProfileEntry: IndividualProfile = {
      name: name!,
      nickname: nickname!,
      bio: bio!,
    };

    try {
      const record: Record = await client.callZome({
        cap_secret: null,
        role_name: "requests_and_offers",
        zome_name: "profiles",
        fn_name: "create_individual_profile",
        payload: IndividualProfileEntry,
      });
      dispatch("indiviual-profile-created", {
        IndividualProfileHash: record.signed_action.hashed.hash,
      });
    } catch (e) {
      errorSnackbar.labelText = `Error creating the indiviual profile: ${e.data.data}`;
      errorSnackbar.show();
    }
  }
</script>

<mwc-snackbar bind:this={errorSnackbar} leading> </mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Create IndividualProfile</span>

  <div style="margin-bottom: 16px">
    <mwc-textarea
      outlined
      label="Name"
      value={name}
      on:input={(e) => {
        name = e.target.value;
      }}
      required
    ></mwc-textarea>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textarea
      outlined
      label="Nickname"
      value={nickname}
      on:input={(e) => {
        nickname = e.target.value;
      }}
      required
    ></mwc-textarea>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textfield
      outlined
      label="Bio"
      value={bio}
      on:input={(e) => {
        bio = e.target.value;
      }}
      required
    ></mwc-textfield>
  </div>

  <mwc-button
    raised
    label="Create IndividualProfile"
    disabled={!isIndividualProfileValid}
    on:click={() => createIndividualProfile()}
  ></mwc-button>
</div>
