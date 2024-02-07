import { AppAgentWebsocket, type AppAgentClient } from '@holochain/client';
import * as path from 'path';
import { setContext } from 'svelte';
import { clientContext } from '../contexts';

export const load: PageLoad = async () => {
  // const hAppPath = new URL(`ws://localhost:35899`);
  // const client = await AppAgentWebsocket.connect(hAppPath, 'requests-and-offers');
  // setContext(clientContext, {
  //   getClient: () => client
  // });
  // return client;
};
