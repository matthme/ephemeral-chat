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

const burnerChatApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weServices: WeServices,
    appletAppInfo: InstalledAppInfo | InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("burner_chat-applet", BurnerChatApplet);
        element.innerHTML = `<burner_chat-applet></burner_chat-applet>`;
        const appletElement = element.querySelector("burner_chat-applet") as any;

        appletElement.appWebsocket =  appWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
      },
      blocks: [],
    };
  },
};

export default burnerChatApplet;