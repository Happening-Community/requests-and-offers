import { CellType, type AppInfo, AdminWebsocket, AppAgentWebsocket } from '@holochain/client';
import { log } from 'console';

export const HOLOCHAIN_APP_ID = 'requests-and-offers';
export const IS_LAUNCHER = import.meta.env.VITE_IS_LAUNCHER;
export const IS_HOLO_HOSTED = import.meta.env.VITE_IS_HOLO_HOSTED;

/**
 * Sets up the Holochain client, connects to the websocket, and authorizes the client if necessary.
 *
 * @return {Promise<AppAgentWebsocket>} The connected Holochain client.
 */
export const setupHolochain = async () => {
  log('Setting up holochain');
  log(import.meta.env);
  // try {
  //   const client = await AppAgentWebsocket.connect(
  //     IS_LAUNCHER ? `ws://UNUSED` : `ws://localhost:${import.meta.env.VITE_HC_PORT}`,
  //     HOLOCHAIN_APP_ID,
  //     60000
  //   );
  //   return client;
  // } catch (e) {
  //   console.log('Holochain client setup error', e);
  //   throw e;
  // }
};

/**
 * Authorizes the client for making zome calls to the Holochain app.
 *
 * @param {AppInfo} appInfo - information about the Holochain app
 * @return {Promise<void>} a Promise that resolves when the client is authorized
 */
// export const authorizeClient = async (appInfo: AppInfo) => {
//   if (typeof window === 'object' && !('__HC_LAUNCHER_ENV__' in window)) {
//     if (!(CellType.Provisioned in appInfo.cell_info.mewsfeed[0])) {
//       throw new Error('mewsfeed cell not provisioned');
//     }
//     const { cell_id } = appInfo.cell_info.mewsfeed[0][CellType.Provisioned];
//     const adminWs = await AdminWebsocket.connect(
//       `ws://localhost:${import.meta.env.VITE_HC_ADMIN_PORT}`
//     );
//     await adminWs.authorizeSigningCredentials(cell_id);
//     console.log('Holochain app client authorized for zome calls');
//   }
// };
