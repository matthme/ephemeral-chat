import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import {
  ProfilesStore,
  profilesStoreContext,
} from "@holochain-open-dev/profiles";
import { InstalledAppInfo, AppWebsocket } from "@holochain/client";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { InstalledAppletInfo } from "@lightningrodlabs/we-applet";
import { BurnerChatApp, BurnerService, burnerServiceContext } from "@burner-chat/elements";
import { sharedStyles } from "./sharedStyles";
import { BurnerChatGroupApp } from "./components/burner-chat-group-app";

export class BurnerChatApplet extends ScopedElementsMixin(LitElement) {
  @property()
  appWebsocket!: AppWebsocket;

  @contextProvider({context: profilesStoreContext})
  @property()
  profilesStore!: ProfilesStore;

  @property()
  appletAppInfo!: InstalledAppletInfo[];

  @property()
  weGroupSecret!: string;

  @state()
  loaded = false;

  async firstUpdated() {
    console.log("INSTANCIATING BurnerChatApplet with appletAppInfo: ", this.appletAppInfo);
    new ContextProvider(this, burnerServiceContext, new BurnerService(this.appWebsocket, this.appletAppInfo[0].installedAppInfo));
    console.log("ProfilesStore: ", this.profilesStore)
    new ContextProvider(this, profilesStoreContext, this.profilesStore);

    this.loaded = true;
  }

  render() {
    console.log("%*%*%*  VERSION 0.0.7 %*%*%*");
    console.log("@burner-chat-applet render(): this.weGroupSecret: ", this.weGroupSecret);
    if (!this.loaded)
      return html`<div
        style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center"
      >
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    // TODO: add any elements that you have in your applet
    return html`
    <div class="flex-scrollable-parent">
      <div class="flex-scrollable-container">
        <div class="flex-scrollable-y">
          <burner-chat-group-app .weGroupSecret=${this.weGroupSecret} style="padding: 0 30px; display: flex; flex: 1;"></burner-chat-group-app>
        </div>
      </div>
    </div>`;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "burner-chat-group-app": BurnerChatGroupApp,
    };
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex: 1;
      }
    `,
  ];
}
