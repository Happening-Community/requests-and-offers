import { AppAgentWebsocket, type AppAgentClient } from '@holochain/client';
import * as path from 'path';
import { setContext } from 'svelte';
import { clientContext } from '../contexts';

export const load: PageLoad = async () => {
  // const parentDir = path.resolve(process.cwd(), '..');
  // const hAppPath = '' as unknown as URL;
  // const client = await AppAgentWebsocket.connect(hAppPath as unknown as URL, 'requests-and-offers');
  // setContext(clientContext, {
  //   getClient: () => client
  // });
  // return client;
};
