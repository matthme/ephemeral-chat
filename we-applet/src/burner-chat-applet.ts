import { contextProvider, ContextProvider } from "@lit-labs/context";
import { property, state } from "lit/decorators.js";
import { InstalledAppInfo, AppWebsocket } from "@holochain/client";
import { ScopedElementsMixin } from "@open-wc/scoped-elements";
import { CircularProgress } from "@scoped-elements/material-web";
import { LitElement, html, css } from "lit";
import { burnerServiceContext, BurnerService, BurnerChatApp } from '@burner-chat/elements';
import { ProfilesStore, profilesStoreContext } from "@holochain-open-dev/profiles";
import { GroupChatScreen } from "./components/group-chat-screen";
import { InstalledAppletInfo } from "@lightningrodlabs/we-applet";
import JSConfetti from 'js-confetti';
import { sharedStyles } from "./sharedStyles";


export class BurnerChatApplet extends ScopedElementsMixin(LitElement) {
  @property()
  appWebsocket!: AppWebsocket;

  @property()
  profilesStore!: ProfilesStore;

  @property()
  appletAppInfo!: InstalledAppletInfo[];

  @property()
  channel!: string;

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
    if (!this.loaded)
      return html`<div
        style="display: flex; flex: 1; flex-direction: row; align-items: center; justify-content: center"
      >
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    // TODO: add any elements that you have in your applet
    return html`
    <div class="flex-scrollable-parent" style="flex: 1;">
      <div class="flex-scrollable-container">
        <div class="flex-scrollable-y">
          <burner-chat-app style="padding: 30px;"></burner-chat-app>
        </div>
      </div>
    </div>`;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "burner-chat-app": BurnerChatApp,
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
