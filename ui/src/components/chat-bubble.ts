
import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext, burnerStoreContext } from '../contexts';
import { BurnerStore } from '../burner-store';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { Message } from '../types/chat';

@customElement('chat-bubble')
export class ChatBubble extends LitElement {

  @contextProvided({ context: burnerStoreContext, subscribe: true })
  store!: BurnerStore;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  @property()
  channel!: string;

  @state()
  chatBuffer!: [number, string][];

  @property()
  name!: string;

  @property()
  avatarUrl!: string;

  @property()
  agentPubKey!: string;


  addToBuffer(msg: Message) {

  }

  async signalCallback(signalInput: AppSignal) {

    let msg: Message = signalInput.data.payload;

    if (serializeHash(msg.senderKey) == this.agentPubKey && this.channel == msg.secret) {
      this.addToBuffer(msg);
    }


    console.log(signalInput);
    (window as any).signalInput = signalInput;
    alert(signalInput.data.payload.payload);
  }

  async firstUpdated() {
    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`,
      undefined, // timeout
      this.signalCallback,
    );

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'ephemeral-chat',
    });

  }


  render() {
    // if (!this._entryDef0) {
    //   return html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
    //     <mwc-circular-progress indeterminate></mwc-circular-progress>
    //   </div>`;
    // }

    // return html`
    //   <div style="display: flex; flex-direction: column">
    //     <span style="font-size: 18px">EntryDef0</span>


    // <title-detail

    // .value=${this._entryDef0.title}
    //   style="margin-top: 16px"
    // ></title-detail>


    // <content-detail

    // .value=${this._entryDef0.content}
    //   style="margin-top: 16px"
    // ></content-detail>

    //   </div>
    // `;
  }
}
