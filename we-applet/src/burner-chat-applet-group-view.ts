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
          <div class="main-title-container column" style="flex: 1; align-itmes: right;">
            <h1 class="main-title">BURNER CHAT</h1>
            <p class="powered-by-holochain" @click=${() => {
              const jsConfetti = new JSConfetti();
              jsConfetti.addConfetti({
                emojis: ['⚡️'],
              });}}>
              powered by holochain
            </p>
          </div>
          <group-chat-screen .channel=${this.channel} style="padding: 30px;"></group-chat-screen>
        </div>
      </div>
    </div>`;
  }

  static get scopedElements() {
    return {
      "mwc-circular-progress": CircularProgress,
      "group-chat-screen": GroupChatScreen,
      // TODO: add any elements that you have in your applet
    };
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex: 1;
      }

      .main-title-container {
        position: relative;
        max-width: 700px;
      }

      .main-title {
        /* font-family: 'Rubik', monospace;
        font-weight: bold;
        color: #17E6B7; */
        margin: 0;
        font-size: 40px;
        font-family: RUBIK;
        font-weight: bold;
        color: #17e6b7;
        letter-spacing: 1px;
      }

      .powered-by-holochain {
        position: absolute;
        top: 42;
        left: 160;
        font-family: 'Roboto Mono';
        font-size: 13px;
        color: #2e354c;
      }
    `,
  ];
}
