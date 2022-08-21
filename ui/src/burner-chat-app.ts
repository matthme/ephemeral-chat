import '@webcomponents/scoped-custom-element-registry';

import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import {
  AgentPubKey,
  AppSignal,
  AppWebsocket,
  EntryHash,
  InstalledAppInfo,
  InstalledCell,
} from '@holochain/client';
import { contextProvided, contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';

import { burnerServiceContext } from './contexts';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import {
  AgentPubKeyB64,
  ChannelMessageInput,
  MessageInput,
  Username,
} from './types/chat';
import { ChatScreen } from './components/chat-screen';
// import { BurnerStore } from './burner-store';
import { BurnerService } from './burner-service';
import { CellClient, HolochainClient } from '@holochain-open-dev/cell-client';
import { BurnerServiceContext } from './components/service-context';
import { TaskSubscriber } from 'lit-svelte-stores';
import JSConfetti from 'js-confetti';
import { robotoMonoNormal, rubikNormal, rubikBold } from './fonts';


export class BurnerChatApp extends LitElement {
  @state() loading = false;
  @state() entryHash: EntryHash | undefined;

  @contextProvided({ context: burnerServiceContext })
  @property({ type: Object })
  service!: BurnerService;

  @query('chat-screen')
  chatScreen!: ChatScreen;

  @query('input#join-channel')
  joinChannelInput!: HTMLInputElement;

  @query('input#enter-name')
  enterNameInput!: HTMLInputElement;

  @query('#test-signal-text-input')
  textInputField!: HTMLInputElement;

  @query('#test-recipient-input')
  recipientInputField!: HTMLInputElement;

  @query('#channel-secret-input')
  channelSecretInputField!: HTMLInputElement;

  // @state()
  // allMyChannels: string[] = [];

  @state() startBttnLoading = false;

  activeChannel = new TaskSubscriber(
    this,
    () => this.service.getChannel(),
    () => [this.service]
  );

  username = new TaskSubscriber(
    this,
    () => this.service.getUsername(),
    () => [this.service]
  );

  @state()
  activeChannelMembers: Record<AgentPubKeyB64, Username> = {};

  constructor() {
    super();
    if(!document.getElementById('burner-chat-fonts')){
      let head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');
          style.id = 'burner-chat-fonts';
          style.type = 'text/css';
          style.innerText = `
            @font-face {
              font-family: 'Roboto Mono';
              font-style: normal;
              font-display: swap;
              font-weight: 400;
              src: url(${robotoMonoNormal});
              unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
            }
            @font-face {
              font-family: 'Rubik';
              font-style: normal;
              font-display: swap;
              font-weight: 400;
              src: url(${rubikNormal});
              unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
            }
            @font-face {
              font-family: 'Rubik';
              font-style: normal;
              font-display: swap;
              font-weight: 700;
              src: url(${rubikBold});
              unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
            }
          `;
          head.appendChild(style);
      }
  }

  signalCallback = async (signal: AppSignal) => {
    // filter only current room
    const signalPayload = signal.data.payload;
    const signalType = signal.data.payload.signalType;
    if (signalType === 'EmojiCannon') {
      // propagate and let chat-screen decide if emoji cannon should be fired
      this.chatScreen.receiveEmojiCannonSignal(signal);
    } else if (
      signalType === 'Message' &&
      signalPayload.channel === this.activeChannel.value
    ) {
      // propagate only when in active room
      this.chatScreen.receiveMessageSignal(signal);
    } else if (
      signalType === 'JoinChannel' &&
      signalPayload.channel === this.activeChannel.value
    ) {
      // @TODO 1. check if join channel is === activeChannel
      const allChatMembers = await this.service.getChannelMembers(
        signalPayload.channel
      );
      const activeChannelMembers: Record<AgentPubKeyB64, Username> = {};
      allChatMembers.forEach(([pubKey, username]) => {
        activeChannelMembers[serializeHash(pubKey)] = username;
      });
      this.activeChannelMembers = activeChannelMembers;
    } else if (
      signalType === 'BurnChannel' &&
      signalPayload.channel === this.activeChannel.value
    ) {
      // console.log("BURNING SIGNAL RECEIVED")
      this.chatScreen.receiveBurnSignal(signal);
    }
  };

  async firstUpdated() {
    this.service.cellClient.addSignalHandler(this.signalCallback);
    this.loading = false;
  }

  async start() {
    // get name and set as username
    let username = this.enterNameInput.value;
    const channelToJoin = this.joinChannelInput.value;

    if (!username) {
      alert('🚧 Plase set a username!');
      return;
    }
    if (!channelToJoin) {
      alert('🚧 You need to set a channel');
      return;
    }
    this.startBttnLoading = true;

    this.service.setUsername(username);

    // get channel secret and join channel
    const channelMessageInput: ChannelMessageInput = {
      signalType: 'JoinChannel',
      channel: channelToJoin,
      username: this.username.value!,
    };
    await this.joinChannel(channelMessageInput);
  }

  async joinChannel(input: ChannelMessageInput): Promise<void> {
    // if (this.allMyChannels.includes(input.channel)) {
    //   return;
    // }
    await this.service.joinChannel(input);
    const channelMembers = await this.service.getChannelMembers(input.channel);
    // console.log(channelMembers);
    this.activeChannelMembers = {};
    channelMembers.forEach(([pubKey, username]) => {
      this.activeChannelMembers[serializeHash(pubKey)] = username;
    });
    console.warn(this.activeChannelMembers);
    // this.allMyChannels = [...this.allMyChannels, input.channel];
    this.service.setChannel(input.channel);
    this.startBttnLoading = false;
  }

  renderLandingPage() {
    return html`
      <p class="tagline">
        No Security<br />
        No Persistence<br />
        Just Signals
      </p>
      <div class="landing-form">
        <input
          class="landing-input"
          .value=${this.username.value ? this.username.value : ''}
          id="enter-name"
          type="text"
          placeholder="enter name"
        />
        <input
          class="landing-input"
          id="join-channel"
          type="text"
          placeholder="join channel"
        />
        <button id="start-bttn" @click=${this.start}>
          ${this.startBttnLoading
            ? html`<div class="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>`
            : html`<div>START</div>`}
        </button>
      </div>
    `;
  }

  async switchChannel(ev: CustomEvent) {
    // console.log("inside switchChannel");
    this.service.setChannel(ev.detail);
    const join_channel_input: ChannelMessageInput = {
      signalType: 'JoinChannel',
      channel: ev.detail,
      username: this.username.value!,
    };

    this.joinChannel(join_channel_input);

    // console.log("new channel value: ", this.activeChannel.value);
  }

  fetchMembers = async () => {
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti({
      emojis: ['⚡️'],
    });

    const members = await this.service.getChannelMembers(
      this.activeChannel.value!
    );
    const newActiveChannelMembers: Record<AgentPubKeyB64, Username> = {};

    members.forEach(([pubKey, username]) => {
      newActiveChannelMembers[serializeHash(pubKey)] = username;
    });
    this.activeChannelMembers = newActiveChannelMembers;
    console.warn('fetching members', this.activeChannelMembers);
  };

  goHome() {
    // console.log("GOING HOME");
    this.service.setChannel(undefined);
  }

  renderChatScreen() {
    return html`
      <chat-screen
        .channelMembers=${this.activeChannelMembers}
        @switchChannel=${this.switchChannel}
        .myAgentPubKey=${this.service.myAgentPubKey}
      ></chat-screen>
    `;
  }

  render() {
    if (this.loading) {
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;
    }

    // console.log("ACTIVE CHANNEL: ", this.activeChannel.value);

    // console.log("CHANNEL MEMBERS: ", this.channelMembers);

    // Landing Page
    // Chat Screen
    //    => bubbles
    //    => my own buuble

    return html`
      <main>
        <div class="main-title-container">
          <h1 class="main-title">BURNER CHAT</h1>
          <p class="powered-by-holochain" @click=${this.fetchMembers}>
            powered by holochain
          </p>
        </div>
        <div id="go-home-menu-bttn" @click=${this.goHome}>🏠️</div>
        ${this.activeChannel.value
          ? this.renderChatScreen()
          : this.renderLandingPage()}
      </main>
    `;
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
      font-size: 25px;
    }
    #go-home-menu-bttn {
      padding: 20px;
      background-color: coral;
      cursor: pointer;
      position: absolute;
      right: 41px;
      top: 51px;
      background: rgb(23, 230, 183);
      border-radius: 50%;
    }
    main {
      min-width: 100vw;
    }

    .main-title-container {
      position: relative;
      max-width: 700px;
      margin: 0 auto;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .powered-by-holochain {
      position: absolute;
      top: 50px;
      right: 0;
      font-family: 'Roboto Mono';
      font-size: 20px;
      color: #2e354c;
    }
    button#start-bttn {
      position: relative;
      all: unset;
      margin: 10px;
      padding: 10px 20px;
      color: red;
      background-color: #2e354c;
      color: #fbfaf8;
      cursor: pointer;
      width: 300px;
      border-radius: 100px;
      font-weight: bold;
      font-family: 'Rubik';
      height: 38px;
    }

    .landing-form {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }

    .tagline {
      font-family: Roboto Mono;
      font-size: 30px;
      margin-top: 80px;
      margin-bottom: 80px;
    }

    input.landing-input {
      all: unset;
      background-color: white;
      margin: 10px;
      padding: 10px 20px;
      box-shadow: 0 0 10px rgb(0 0 0 / 10%);
      border-radius: 100px;
      width: 300px;
    }
    input.landing-input::placeholder {
      /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: #adadad;
    }

    .main-title {
      /* font-family: 'Rubik', monospace;
      font-weight: bold;
      color: #17E6B7; */
      font-size: 70px;
      font-family: RUBIK;
      font-weight: bold;
      color: #17e6b7;
      letter-spacing: 4px;
    }

    /**CSS LOADING SPINNER */
    .lds-ellipsis {
      top: -19px;
      display: inline-block;
      width: 80px;
      height: 80px;
      margin-left: auto;
      margin-right: auto;
      left: 0;
      right: 0;
      text-align: center;
      position: relative;
    }
    .lds-ellipsis div {
      position: absolute;
      top: 33px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: #fff;
      animation-timing-function: cubic-bezier(0, 1, 1, 0);
    }
    .lds-ellipsis div:nth-child(1) {
      left: 8px;
      animation: lds-ellipsis1 0.6s infinite;
    }
    .lds-ellipsis div:nth-child(2) {
      left: 8px;
      animation: lds-ellipsis2 0.6s infinite;
    }
    .lds-ellipsis div:nth-child(3) {
      left: 32px;
      animation: lds-ellipsis2 0.6s infinite;
    }
    .lds-ellipsis div:nth-child(4) {
      left: 56px;
      animation: lds-ellipsis3 0.6s infinite;
    }
    @keyframes lds-ellipsis1 {
      0% {
        transform: scale(0);
      }
      100% {
        transform: scale(1);
      }
    }
    @keyframes lds-ellipsis3 {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(0);
      }
    }
    @keyframes lds-ellipsis2 {
      0% {
        transform: translate(0, 0);
      }
      100% {
        transform: translate(24px, 0);
      }
    }
  `;

  static get scopedElements() {
    return {
      'chat-screen': ChatScreen,
    };
  }
}

/**
LOADED FONTS, use like this
font-family: 'Roboto Mono', monospace;
font-family: 'Rubik', sans-serif;
 */
