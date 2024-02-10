import { CellType, type AppInfo, AdminWebsocket, AppAgentWebsocket } from '@holochain/client';

export const HOLOCHAIN_APP_ID = 'mewsfeed';
export const IS_LAUNCHER = import.meta.env.VITE_IS_LAUNCHER;
export const IS_HOLO_HOSTED = import.meta.env.VITE_IS_HOLO_HOSTED;

export const setupHolochain = async () => {
  try {
    // console.log(import.meta.env);
    // const client = await AppAgentWebsocket.connect(
    //   IS_LAUNCHER ? `ws://UNUSED` : `ws://localhost:${import.meta.env.VITE_HC_PORT}`,
    //   HOLOCHAIN_APP_ID,
    //   60000
    // );
    // if (typeof window === 'object' && !('__HC_LAUNCHER_ENV__' in window)) {
    //   const appInfo = await client.appInfo();
    //   await authorizeClient(appInfo);
    // }
    // return client;
  } catch (e) {
    console.log('Holochain client setup error', e);
    throw e;
  }
};

// set up zome call signing when run outside of launcher
export const authorizeClient = async (appInfo: AppInfo) => {
  if (typeof window === 'object' && !('__HC_LAUNCHER_ENV__' in window)) {
    if (!(CellType.Provisioned in appInfo.cell_info.mewsfeed[0])) {
      throw new Error('mewsfeed cell not provisioned');
    }
    const { cell_id } = appInfo.cell_info.mewsfeed[0][CellType.Provisioned];
    const adminWs = await AdminWebsocket.connect(
      `ws://localhost:${import.meta.env.VITE_HC_ADMIN_PORT}`
    );
    await adminWs.authorizeSigningCredentials(cell_id);
    console.log('Holochain app client authorized for zome calls');
  }
};
