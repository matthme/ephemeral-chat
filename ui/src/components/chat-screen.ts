
import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext, burnerStoreContext } from '../contexts';
import { BurnerStore } from '../burner-store';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { Message } from '../types/chat';
import { TaskSubscriber } from 'lit-svelte-stores';
import { ChatBubble } from './chat-bubble';

@customElement('chat-screen')
export class ChatScreen extends LitElement {

  @contextProvided({ context: burnerStoreContext, subscribe: true })
  store!: BurnerStore;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  @property()
  channel!: string;

  @state()


  _channelMembersTask = new TaskSubscriber(
    this,
    () => this.store.fetchChannelMembers(this.channel),
    () => [this.channel]
  );


  async signalCallback(signalInput: AppSignal) {
    let msg: Message = signalInput.data.payload;
    console.log(signalInput);
    (window as any).signalInput = signalInput;
    // alert(signalInput.data.payload.payload);
  }

  async firstUpdated() {
    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`,
      undefined, // timeout
      this.signalCallback,
    );

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'burner-chat',
    });
  }


  render() {
    const chatBubbles: any[] = [
      {
        channel: this.channel,
        username: "dcts",
        avatarUrl: "https://img.seadn.io/files/66196dd65af5e25c2fac209b0e33bd8d.png?auto=format&fit=max&w=256",
        agentPubKey: "ascou3v8asv8yx0984v0p7duzk"
      },
      {
        channel: this.channel,
        username: "Art Brock",
        avatarUrl: "https://img.seadn.io/files/45e5b8384841b475e7411dafd6c6291a.png?auto=format&fit=max&w=256",
        agentPubKey: "x7f33168savLSKJOIQzasd"
      },
      {
        channel: this.channel,
        username: "dcts",
        avatarUrl: "https://img.seadn.io/files/4f809b585367ec71fa19daba04066cd0.png?auto=format&fit=max&w=256",
        agentPubKey: "v8274sduv2874eva98dv0lki"
      },
    ]
    return html`
      ${chatBubbles.map(chatBubbleObj => {
        let { channel, username, avatarUrl, agentPubKey } = chatBubbleObj;
        return html`<chat-bubble
          channel="${channel}"
          username="${username}"
          avatarUrl="${avatarUrl}"
          agentPubKey="${agentPubKey}"
        >${username}</chat-bubble>`
      })}
    `
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

  static get scopedElements() {
    return {
      "chat-bubble": ChatBubble,
    }
  }
}
