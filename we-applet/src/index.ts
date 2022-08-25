import {
  AdminWebsocket,
  AppWebsocket,
  InstalledAppInfo,
  InstalledCell,
} from "@holochain/client";
import {
  WeApplet,
  AppletRenderers,
  WeServices,
  InstalledAppletInfo,
} from "@lightningrodlabs/we-applet";

import { BurnerChatApplet } from "./burner-chat-applet";

const burner_chatApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weServices: WeServices,
    appletAppInfo: InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        const weGroupChannelSecret = appletAppInfo[0].weInfo.name + "-" + appletAppInfo[0].installedAppInfo.installed_app_id;
        registry.define("burner_chat-applet", BurnerChatApplet);
        element.innerHTML = `<burner_chat-applet style="flex: 1; display: flex; font-family: sans-serif; background-color: #ededed; margin: 0;"></burner_chat-applet>`;
        const appletElement = element.querySelector("burner_chat-applet") as any;

        appletElement.weGroupSecret = weGroupChannelSecret;
        appletElement.appWebsocket = appWebsocket;
        appletElement.profilesStore = weServices.profilesStore;
        appletElement.appletAppInfo = appletAppInfo;
      },
      blocks: [],
    };
  },
};

export default burner_chatApplet;
