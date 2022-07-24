import { LitElement, css, html, CSSResultGroup } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, EntryHash, InstalledAppInfo, AgentPubKey, AppSignal } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext, burnerServiceContext } from '../contexts';
import { serializeHash, deserializeHash } from '@holochain-open-dev/utils';
import { AgentPubKeyB64, Message, MessageInput, Username } from '../types/chat';
import JSConfetti from 'js-confetti';
import { BurnerService } from '../burner-service';
import { TaskSubscriber } from 'lit-svelte-stores';
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

  @contextProvided({ context: burnerServiceContext, subscribe: true })
  @state()
  service!: BurnerService;

  @property()
  showEmoji: boolean = true;

  @state()
  chatBuffer: ChatBufferElement[] = [];

  @state()
  chatBufferString: string = "";

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

  @property({ type: Object })
  @state()
  channelMembers: Record<AgentPubKeyB64, Username> = {};

  @state()
  timer: any = null;

  @state()
  isConfettiSource: boolean = false;

  channel = new TaskSubscriber(
    this,
    () => this.service.getChannel(),
    () => [this.service]
  );

  addToBuffer(chatBufferElement: ChatBufferElement) {
    // let newBuffer = this.chatBuffer.concat(chatBufferElement);
    this.chatBuffer = [...this.chatBuffer, chatBufferElement];
    // this.printBuffer();
  }

  updateBuffer() {
    const now = new Date();
    this.chatBuffer = this.chatBuffer.filter(chatBufferElement => {
      const timestamp = chatBufferElement.timestamp;
      const writeDate = new Date(timestamp/1000);
      const delta = Number(now)-Number(writeDate)
      return delta < 3500;
    });
    this.chatBufferString = this.bufferToString();
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

  async _handleEmojiClick(emoji: string) {

    const recipients = Object.keys(this.channelMembers).map(key => deserializeHash(key));

    const msgInput: MessageInput = {
      signalType: "EmojiCannon",
      payload: emoji,
      senderName: this.username,
      recipients: recipients,
      channel: this.channel.value!,
    }

    await this.service.sendMsg(msgInput);

    const jsConfetti = new JSConfetti()
    jsConfetti.addConfetti({
      emojis: [emoji],
    })
  }


  receiveSignal(signal: AppSignal) {
    if (this.isAdmin) {
      return; // no logic for admin
    }
    const str = signal.data.payload.payload;
    const timestamp = signal.data.payload.timestamp;
    // const
    const newChatBufferElement: ChatBufferElement = {
      timestamp,
      payload: str,
    };
    this.addToBuffer(newChatBufferElement);

    const textarea = this.shadowRoot?.getElementById("non-admin-text-bubble") as HTMLTextAreaElement;
    textarea.value += str;
  }



  causedEmojiCannon() {
    if (this.isAdmin) {
      return; // no logic for admin
    }
    this.isConfettiSource = true;
    const confettSourceInterval = setInterval(() => this.isConfettiSource = !this.isConfettiSource, 400);

    setTimeout(() => {
      clearInterval(confettSourceInterval);
      this.isConfettiSource = false;
    }, 1200);

  }

  // async signalCallback(signalInput: AppSignal) {

  //   let msg: Message = signalInput.data.payload;

  //   const sameAgent = serializeHash(msg.senderKey) === this.agentPubKey;
  //   const sameChannel = this.channel.value === msg.secret;
  //   if (sameAgent && sameChannel) {
  //     this.addToBuffer(msg);
  //     console.log(this.bufferToString());
  //   }

  //   console.log(signalInput);
  //   (window as any).signalInput = signalInput;
  //   // alert(signalInput.data.payload.payload);
  // }

  async firstUpdated() {
    if (this.isAdmin) {
      setInterval(() => {
        const currentValue = (this.shadowRoot?.getElementById("admin-text-bubble") as HTMLTextAreaElement).value;
        const dropN = Math.floor(currentValue.length * 0.2) + 1;
        const textField = (this.shadowRoot?.getElementById("admin-text-bubble") as HTMLTextAreaElement)

        const newValue = currentValue.slice(dropN);
        textField.value = newValue;

      }, 1000);
    } else {
      setInterval(() => {
          this.updateBuffer();
          // this.printBuffer();
      }, 200);
    }
  }

  renderEmoji(emoji: string, i: number) {
    return html`
    <button @click="${() => this._handleEmojiClick(emoji)}" class="emoji-btn">
      <div class="${emoji === '🔥' ? 'waving' : ''}">${emoji}</span>
    </button>`
  }


  async dispatchRealtimeSignal(ev: KeyboardEvent) {
    clearTimeout(this.timer);
    // only admin type can send messages
    // get character from keystroke
    const isNotAdmin = !this.isAdmin;
    const isInvalidKey = !ev.key.match(/^[A-Za-z0-9_.+/><\\?!$-:; ]$/g);
    if (isNotAdmin || isInvalidKey) {
      return;
    }
    const msgText = ev.key;
    const recipients = Object.keys(this.channelMembers).map(key => deserializeHash(key));

    // console.log(ev.key);
    const msgInput: MessageInput = {
      signalType: "Message",
      payload: msgText,
      senderName: this.username,
      recipients: recipients,
      channel: this.channel.value!,
    }
    await this.service.sendMsg(msgInput);
  }


  render() {
    return html`
        <div class="chat-bubble ${this.isConfettiSource ? "confetti-source" : ""}">
          <div class="chat-quote ${this.isAdmin ? 'admin': ''}">
            ${this.isAdmin
              ? html`<textarea id="admin-text-bubble" @keyup=${this.dispatchRealtimeSignal} placeholder="Insert your message" rows="2" wrap="hard" maxlength="50"></textarea>`
              : html`<textarea id="non-admin-text-bubble" disabled rows="2" wrap="hard" maxlength="50" .value=${this.chatBufferString}></textarea>`
            }
          </div>

          <div class="chat-buttons ${this.isAdmin ? "" : "non-admin-chat-buttons"}">
            ${this.isAdmin ? html`
            <div class="emoji-container">
              ${this.emojis.map((e, i) => this.renderEmoji(e, i))}
            </div>` : ''}
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
    padding: 8px;
    margin: 8px;
    max-width: 500px;
    position: relative;
  }

  .confetti-source {
    background: orange;
    border-radius: 20px;
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
    background-position: center;
    width: 100%;
    transition: ease-in-out 0.5s;
    z-index: 1;
  }

  .admin.chat-quote:hover {
    transform: scale(1.2);
    transition: transform 0.5s ease-in-out;
    z-index: 1;
  }

  .chat-quote > textarea {
    all: unset;
    width: 92%;
    align-self: flex-start;
    margin-top: 27px;
    max-height: 3.6rem;
    margin-left: 10px;
    margin-right: 10px;
    overflow: hidden;
  }

  .chat-buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: -40px; // a hack
  }

  .non-admin-chat-buttons {
    flex-direction: row-reverse;
    position: absolute;
    right:0;
  }

  .emoji-container {
    display: flex;
    position: relative;
    flex-wrap: wrap;
    max-width: 200px;
    justify-content: space-evenly;
    margin-left: 10px;
  }

  .emoji-btn {
    background-color: rgb(255 255 255);
    border: 1px solid rgb(234 234 234);

    border-radius: 9px;
    margin: 5px;
    /* padding: 10px; */
    font-size: large;
    font-weight: bolder;
  }

  .emoji-btn:nth-child(4),
  .emoji-btn:nth-child(8) {
    opacity: 0;
  }

  .avatar-container {
    display: flex;
    align-self: center;
    flex-direction: column;
    margin-right: 30px;
    position: relative !important;
  }

  img.avatar {
    border-radius: 50%;
    align-self: center; // maybe align all to center?
  }

  .avatar-container > .avatar-name {
    display: flex;
    align-self: center;  // maybe align all to center?
    /* position: relative; */
  }
  .avatar-name {
    margin-top: 2px;
    font-family: 'Roboto Mono';
    font-size: 22px;
    font-weight: bold;
    position: absolute;
    bottom: -28px;
    /* bottom: -7px; */
  }

` as CSSResultGroup;

}
