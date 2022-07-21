
import { LitElement, css, html, CSSResultGroup } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext } from '../contexts';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { Message } from '../types/chat';
import JSConfetti from 'js-confetti';
// import logo from '../components/images/bubble-big.png';

interface ChatBufferElement {
  timestamp: number,
  payload: string,
}

@customElement('chat-bubble')
export class ChatBubble extends LitElement {

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  @property()
  channel!: string | undefined;

  @property()
  showEmoji: boolean = true;

  @state()
  chatBuffer!: ChatBufferElement[];

  @state()
  emojis: string[] = ['🌈', '⚡️', '💥', '✨', '💫', '🌸', '🦄', '🔥'];

  @property()
  username!: string;

  @property()
  avatarUrl!: string;

  @property()
  agentPubKey!: string;

  @property()
  isAdmin: boolean = false;

  addToBuffer(msg: Message) {
    let chatBufferElement = {
      timestamp: msg.timestamp,
      payload: msg.payload
    };
    // let newBuffer = this.chatBuffer.concat(chatBufferElement);
    this.chatBuffer = [...this.chatBuffer, chatBufferElement];
    this.printBuffer();
  }

  updateBuffer() {

  }

  sortBuffer() {
    let sortedBuffer = this.chatBuffer.sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
    this.chatBuffer = sortedBuffer;
  }

  bufferToString() {
    return this.chatBuffer.map(chatBufferObj => {
      return chatBufferObj.payload;
    }).join("");
  }

  printBuffer() {
    console.log(this.bufferToString());
  }

  _handleClick(emoji: string) {
    const jsConfetti = new JSConfetti()
    jsConfetti.addConfetti({
      emojis: [emoji],
    })
  }

  recieveSignal(signal: AppSignal) {
    const str = signal.data.payload.payload;
    const timestamp = signal.data.payload.timestamp;
    console.log({ str });
    console.log({ timestamp });
  }

  async signalCallback(signalInput: AppSignal) {

    let msg: Message = signalInput.data.payload;

    const sameAgent = serializeHash(msg.senderKey) == this.agentPubKey;
    const sameChannel = this.channel == msg.secret;
    if (sameAgent && sameChannel) {
      this.addToBuffer(msg);
      console.log(this.bufferToString());
    }

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

  renderEmoji(emoji: string, i: number) {
    return html`
    <button @click="${() => this._handleClick(emoji)}" class="emoji-btn">
      <div class="${emoji === '🔥' ? 'waving' : ''}">${emoji}</span>
    </button>`
  }

  render() {
    return html`
        <div class="chat-bubble">
          <div class="chat-quote">
            <textarea placeholder="Insert your message" rows="2" wrap="hard" maxlength="50"></textarea>
          </div>
        
          <div class="chat-buttons">
            <div class="emoji-container">
              ${this.emojis.map((e, i) => this.renderEmoji(e, i))}
            </div>
            <div class="avatar-container">
              <img src=${this.avatarUrl} width="50" height="50" class="avatar" />
              <div class="avatar-name">${this.username}</div>
            </div>
        
          </div>
        </div>
    `
  }

  static styles = css`
  
  .waving {
    animation-name: wave-animation;
    animation-duration: 3.0s;
    animation-iteration-count: infinite;
    transform-origin: 70% 70%;
  }

  @keyframes wave-animation {
    0% {
    transform: rotate( 0.0deg)
    }
    10% {
    transform: rotate(14.0deg)
    }
    20% {
    transform: rotate(-8.0deg)
    }
    30% {
    transform: rotate(14.0deg)
    }
    40% {
    transform: rotate(-4.0deg)
    }
    50% {
    transform: rotate(10.0deg)
    }
    60% {
    transform: rotate( 0.0deg)
    }
    100% {
    transform: rotate( 0.0deg)
    }
  }

  .chat-bubble {
    background-color: white;
    border: 1px solid gray;
    padding: 8px;
  }

  .chat-header {
    margin: 0.2rem;
  }

  .chat-quote {
    display: flex;
    background-image: url(public/bubble-big.png);
    background-size: contain;
    height: 140px;
    background-repeat: no-repeat;
    width: 100%;
  }

  .chat-quote > textarea {
    all: unset;
    width: 100%;
    align-self: flex-start;
    margin-top: 20px; // or flex shrink 2
    margin-left: 10px;
    margin-right: 10px;
    max-height: 3rem;
  }

  .chat-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: -40px; // a hack
  }

  .emoji-container {
    display: flex;
    flex-wrap: wrap;
    /* flex: 1; */
    width: 55%;
    justify-content: space-evenly;
  }


  .emoji-btn {
    background-color: rgb(126, 54, 54);
    border: 1px solid rgb(126, 54, 54);
    border-radius: 9px;
    margin: 5px;
    /* padding: 10px; */
    font-size: large;
    font-weight: bolder;
  }

  .avatar-container {
    display: flex;
    align-self: center;
    flex-direction: column;
  }

  img.avatar {
    border-radius: 50%;
    background-color: blue;
    align-self: center; // maybe align all to center?
  }

  .avatar-container > .avatar-name {
    display: flex;
    align-self: center;  // maybe align all to center?
  }
  .avatar-name {
    margin-top: 20px;
  }


` as CSSResultGroup;

}
