
import { LitElement, html, css, CSSResultGroup } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext, burnerServiceContext } from '../contexts';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { Message } from '../types/chat';
import { TaskSubscriber } from 'lit-svelte-stores';
import { ChatBubble } from './chat-bubble';
import { BurnerService } from '../burner-service';
import { randomAvatar } from '../helpers/random-avatars';

@customElement('chat-screen')
export class ChatScreen extends LitElement {
  receiveMessage(signalInput: AppSignal) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super();
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  @contextProvided({ context: burnerServiceContext, subscribe: true })
  @state()
  service!: BurnerService;

  // service!: BurnerService;

  @state()
  channelMembers!: string[];

  @property()
  channel: string | undefined;

  // async signalCallback(signalInput: AppSignal) {
  //   let msg: Message = signalInput.data.payload;
  //   console.log(signalInput);
  //   (window as any).signalInput = signalInput;
  //   // alert(signalInput.data.payload.payload);
  // }

  // setService(service: BurnerService) {
  //   console.log("assigning chat-screen service");
  //   this.service = service;
  //   console.log("this.service");
  //   console.log(this.service);
  // }

  async firstUpdated() {
    // do stuff
    console.log("FIRST UPDATED CHAT_SCREEN");
    console.log("this.service");
    console.log(this.service);
  }

  receiveEmojiCannonSignal(signal: AppSignal) {
    // @TODO: filter by agentPubKey, check if agent exist as chat-bubble
  }

  receiveMessageSignal(signal: AppSignal) {
    // @TODO: filter by agentPubKey, check if agent exist as chat-bubble
  }

  receiveJoinSignal(signal: AppSignal) {
    const joiningMember = signal.data.payload.agent;
    // @TODO => ensure that joining member is of type AgentPubKeyB64
    // this.channelMembers = [...this.channelMembers, joiningMember];
  }

  receiveBurnSignal(signal: AppSignal) {
    const memberWhoBurns = signal.data.payload.agent;
    // @TODO => ensure that joining member is of type AgentPubKeyB64
    // this.channelMembers = [...this.channelMembers, joiningMember];
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
      {
        channel: this.channel,
        username: "dcts",
        avatarUrl: "https://img.seadn.io/files/4f809b585367ec71fa19daba04066cd0.png?auto=format&fit=max&w=256",
        agentPubKey: "v8274sduv2874eva98dv0lki"
      },
      {
        channel: this.channel,
        username: "dcts",
        avatarUrl: "https://img.seadn.io/files/4f809b585367ec71fa19daba04066cd0.png?auto=format&fit=max&w=256",
        agentPubKey: "v8274sduv2874eva98dv0lki"
      },
    ]
    return html`
    <div class="chat-screen">
      <!-- <div class="chat-name"> -->
        <!-- <h1>${this.channel}</h1> -->
      <!-- </div> -->
        <div class="chat-bubblez">
          ${chatBubbles.map(chatBubbleObj => {
            let { channel, username, avatarUrl, agentPubKey } = chatBubbleObj;
            return html`<chat-bubble
              .channel=${channel}
              .username=${username}
              .avatarUrl=${avatarUrl}
              .agentPubKey=${agentPubKey}
            >${username}</chat-bubble>`
          })}
        </div>
      </div>
    `
  // render() {
    // const chatBubbles: any[] = [
    //   {
    //     channel: this.channel,
    //     username: "dcts",
    //     avatarUrl: "https://img.seadn.io/files/66196dd65af5e25c2fac209b0e33bd8d.png?auto=format&fit=max&w=256",
    //     agentPubKey: "ascou3v8asv8yx0984v0p7duzk"
    //   },
    //   {
    //     channel: this.channel,
    //     username: "Art Brock",
    //     avatarUrl: "https://img.seadn.io/files/45e5b8384841b475e7411dafd6c6291a.png?auto=format&fit=max&w=256",
    //     agentPubKey: "x7f33168savLSKJOIQzasd"
    //   },
    //   {
    //     channel: this.channel,
    //     username: "dcts",
    //     avatarUrl: "https://img.seadn.io/files/4f809b585367ec71fa19daba04066cd0.png?auto=format&fit=max&w=256",
    //     agentPubKey: "v8274sduv2874eva98dv0lki"
    //   },
    // ]

    // ${this.channelMembers.map(channelMember => {
    //   let avatar = randomAvatar();
    //   let { username, agentPubKey } = chatBubbleObj;
    //   return html`<chat-bubble
    //     .channel=${this.channel}
    //     .username=${username}
    //     .avatarUrl=${avatar}
    //     .agentPubKey=${agentPubKey}
    //   >${username}</chat-bubble>`
    // })}
    // return html`
    //   <h1>${this.channel}</h1>
    // `
    // if (!this._entryDef0) {
    //   return html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
    //     <mwc-circular-progress indeterminate></mwc-circular-progress>
    //   </div>`;
    // }

    // return html`
    //   <div style="display: flex; flex-direction: column">
    //     <span style="font-size: 18px">EntryDef0</span>


// if (this.allMyChannels.includes(channelToJoin)) {
//       return;
//     }
  renderChannelSelector() {
    return html`
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="font">Current Channel</div>
        <input .value=${this.channel!} style="all: unset; border-bottom: 2px solid black;"/>
      </div>
    `
  }

  render() {
    
    return html`
     ${this.renderChannelSelector()}
    `;
    // // const chatBubbles: any[] = [
    // //   {
    // //     channel: this.channel,
    // //     username: "dcts",
    // //     avatarUrl: "https://img.seadn.io/files/66196dd65af5e25c2fac209b0e33bd8d.png?auto=format&fit=max&w=256",
    // //     agentPubKey: "ascou3v8asv8yx0984v0p7duzk"
    // //   },
    // //   {
    // //     channel: this.channel,
    // //     username: "Art Brock",
    // //     avatarUrl: "https://img.seadn.io/files/45e5b8384841b475e7411dafd6c6291a.png?auto=format&fit=max&w=256",
    // //     agentPubKey: "x7f33168savLSKJOIQzasd"
    // //   },
    // //   {
    // //     channel: this.channel,
    // //     username: "dcts",
    // //     avatarUrl: "https://img.seadn.io/files/4f809b585367ec71fa19daba04066cd0.png?auto=format&fit=max&w=256",
    // //     agentPubKey: "v8274sduv2874eva98dv0lki"
    // //   },
    // // ]
    // return html`
    //   <h1>${this.channel}</h1>
    //   <!-- ${this.channelMembers.map(channelMember => {
    //     let avatar = randomAvatar();
    //     let { username, agentPubKey } = chatBubbleObj;
    //     return html`<chat-bubble
    //       .channel=${this.channel}
    //       .username=${username}
    //       .avatarUrl=${avatar}
    //       .agentPubKey=${agentPubKey}
    //     >${username}</chat-bubble>`
    //   })} -->
    // `
    // // if (!this._entryDef0) {
    // //   return html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
    // //     <mwc-circular-progress indeterminate></mwc-circular-progress>
    // //   </div>`;
    // // }

    // // return html`
    // //   <div style="display: flex; flex-direction: column">
    // //     <span style="font-size: 18px">EntryDef0</span>


    // // <title-detail

    // // .value=${this._entryDef0.title}
    // //   style="margin-top: 16px"
    // // ></title-detail>


    // // <content-detail

    // // .value=${this._entryDef0.content}
    // //   style="margin-top: 16px"
    // // ></content-detail>

    // //   </div>
    // // `;
  }

  static styles = css`
    .chat-screen {
      display: flex;
    }

    .chat-bubblez {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
    }
    
    /* .chat-bubblez > chat-bubble {
      flex: 1 1 250px;
    } */
    
  ` as CSSResultGroup;

  static get scopedElements() {
    return {
      "chat-bubble": ChatBubble,
    }
  }
}
