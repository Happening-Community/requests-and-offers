import { AppAgentWebsocket } from '@holochain/client';

export default class HolochainClientService {
  private static instance: HolochainClientService;
  private client: AppAgentWebsocket;

  private readonly HOLOCHAIN_APP_ID = 'requests-and-offers';
  private readonly IS_LAUNCHER = import.meta.env.VITE_IS_LAUNCHER;
  private readonly HC_PORT = import.meta.env.VITE_HC_PORT;

  private constructor() {}

  private async initialize() {
    try {
      this.client = await AppAgentWebsocket.connect(
        this.IS_LAUNCHER ? `ws://UNUSED` : `ws://localhost:${this.HC_PORT}`,
        this.HOLOCHAIN_APP_ID,
        60000
      );
    } catch (e) {
      console.log('Holochain client setup error', e);
      throw e;
    }
  }

  public static async getInstance(): Promise<HolochainClientService> {
    if (!HolochainClientService.instance) {
      const instance = new HolochainClientService();
      await instance.initialize();
      HolochainClientService.instance = instance;
    }
    return HolochainClientService.instance;
  }
}
