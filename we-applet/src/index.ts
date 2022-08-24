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
    appletAppInfo: InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        console.log("APPLET APP INFO: ", appletAppInfo); // <-- appletAppInfo looks fine here
        registry.define("burner-chat-applet", BurnerChatApplet);
        console.log("BurnerChatApplet", BurnerChatApplet); // <-- BurnerChatApplet component looks fine here
        // const channelSecret = appletAppInfo[0].weInfo.name + "_" + appletAppInfo[0].installedAppInfo.installed_app_id;
        element.innerHTML = `<burner-chat-applet id="burner-chat-applet" style="flex: 1; display: flex;></burner-chat-applet>`;
        let appletElement = element.querySelector("burner-chat-applet") as any;
        console.log("APPLET ELEMENT: ", appletElement); // <-- is null ?!?!

        // appletElement.profilesStore = weServices.profilesStore;
        appletElement.appWebsocket =  appWebsocket;
        appletElement.appletAppInfo = appletAppInfo;
      },
      blocks: [
        // {
        //   name: "merge-eye-view",
        //   render: (element: HTMLElement, registry: CustomElementRegistry) => {
        //     registry.define("cross-we-burner-chat", CrossWeBurnerChat);
        //     element.innerHTML = `<cross-we-burner-chat style="flex: 1; display: flex;"></cross-we-burner-chat>`;
        //     let appletElement = element.querySelector("cross-we-burner-chat") as any;

        //     appletElement.appWebsocket =  appWebsocket;
        //     appletElement.appletAppsInfo = appletAppInfo;
        //   }
        // },
    ],
    };
  },
};

export default burnerChatApplet;
