import { setupHolochain } from "$lib/utils/client";

export const load: PageLoad = async () => {
  setupHolochain();
};
