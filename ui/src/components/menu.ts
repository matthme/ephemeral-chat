import { contextProvided } from "@lit-labs/context";
import { css, CSSResultGroup, html, LitElement } from "lit";
import { TaskSubscriber } from "lit-svelte-stores";
import { customElement, query, state } from "lit/decorators.js";
import { property } from "lodash";
import { BurnerService } from "../burner-service";
import { burnerServiceContext } from "../contexts";

@customElement('drawer-menu')
export class Drawer extends LitElement {

  @contextProvided({ context: burnerServiceContext, subscribe: true })
  @state()
  service!: BurnerService;

  @query("input#current-channel")
  currentChannelInput!: HTMLInputElement;
  
  channel = new TaskSubscriber(
    this,
    () => this.service.getChannel(),
    () => [this.service]
  );

  submitChannelChange(ev: SubmitEvent) {
    ev.preventDefault();
    const newChannel = this.currentChannelInput.value;
    console.log("requesting channel change to " + newChannel);
    // this.channel = newChannel;
    this.dispatchEvent(
      new CustomEvent("switchChannel", {
        detail: newChannel,
        bubbles: true,
        composed: true,
      })
    );
  }

  renderChannelSelector() {
    return html`
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div>Current Channel</div>
        <!-- <form @submit=${this.submitChannelChange}> -->
        <form>
          <input 
          id="current-channel" 
            .value=${this.channel.value as string} 
            style="all: unset; border-bottom: 2px solid black;" />
        </form>
      </div>`
  }

  render() {
    return html`
      <input id="hamburger" class="hamburger" type="checkbox" />
      <label class="hamburger" for="hamburger">
        <i></i>
        <text>
          <close>close</close>
          <open>menu</open>
        </text>
      </label>
      <section class="drawer-list">
        <ul>
          <li>${this.renderChannelSelector()}</li>
          <li><a href="#">payment dashboard</a></li>
          <li><a href="#">email notifications</a></li>
          <li><a href="#">system administration</a></li>
          <li><a href="#">no support</a></li>
        </ul>
      </section>`
  }

  static styles = css`

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.drawer-list {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  transform: translate(100vw, 0);
  /* ie workaround */
  -ms-transform: translatex(-100vw);
  box-sizing: border-box;
  pointer-events: none;
  padding-top: 125px;
  transition: width 475ms ease-out, transform 450ms ease, border-radius 0.8s 0.1s ease;
  border-bottom-left-radius: 100vw;
  background-color: #3d88ce;
  background-color: rgba(12, 106, 194, 0.8);
}
@media (min-width: 768px) {
  .drawer-list {
    width: 40vw;
  }
}
.drawer-list ul {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: auto;
  overflow-x: hidden;
  pointer-events: auto;
}

.drawer-list li {
  list-style: none;
  text-transform: uppercase;
  pointer-events: auto;
  white-space: nowrap;
  box-sizing: border-box;
  transform: translatex(100vw);
  font-weight: bold;
  /* ie workaround */
  -ms-transform: translatex(-100vw);
}
.drawer-list li:last-child {
  margin-bottom: 2em;
}
.drawer-list li a {
  text-decoration: none;
  color: #090909;
  text-align: center;
  display: block;
  padding: 1rem;
  font-size: calc(24px - .5vw);
}
@media (min-width: 768px) {
  .drawer-list li a {
    text-align: right;
    padding: 0.5rem;
  }
}
.drawer-list li a:hover {
  cursor: pointer;
  background-color: #88c2f8;
  background-color: rgba(17, 132, 240, 0.5);
}

input.hamburger {
  display: none;
}
input.hamburger:checked ~ .drawer-list {
  transform: translatex(0);
  border-bottom-left-radius: 0;
}
input.hamburger:checked ~ .drawer-list li {
  transform: translatex(0);
}
input.hamburger:checked ~ .drawer-list li:nth-child(1) {
  transition: transform 1s 0.08s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(2) {
  transition: transform 1s 0.16s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(3) {
  transition: transform 1s 0.24s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(4) {
  transition: transform 1s 0.32s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(5) {
  transition: transform 1s 0.4s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(6) {
  transition: transform 1s 0.48s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(7) {
  transition: transform 1s 0.56s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(8) {
  transition: transform 1s 0.64s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(9) {
  transition: transform 1s 0.72s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(10) {
  transition: transform 1s 0.8s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(11) {
  transition: transform 1s 0.88s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(12) {
  transition: transform 1s 0.96s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(13) {
  transition: transform 1s 1.04s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(14) {
  transition: transform 1s 1.12s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(15) {
  transition: transform 1s 1.2s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(16) {
  transition: transform 1s 1.28s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(17) {
  transition: transform 1s 1.36s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(18) {
  transition: transform 1s 1.44s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(19) {
  transition: transform 1s 1.52s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(20) {
  transition: transform 1s 1.6s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(21) {
  transition: transform 1s 1.68s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(22) {
  transition: transform 1s 1.76s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(23) {
  transition: transform 1s 1.84s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(24) {
  transition: transform 1s 1.92s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(25) {
  transition: transform 1s 2s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(26) {
  transition: transform 1s 2.08s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(27) {
  transition: transform 1s 2.16s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(28) {
  transition: transform 1s 2.24s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(29) {
  transition: transform 1s 2.32s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(30) {
  transition: transform 1s 2.4s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(31) {
  transition: transform 1s 2.48s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(32) {
  transition: transform 1s 2.56s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(33) {
  transition: transform 1s 2.64s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(34) {
  transition: transform 1s 2.72s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(35) {
  transition: transform 1s 2.8s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(36) {
  transition: transform 1s 2.88s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(37) {
  transition: transform 1s 2.96s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(38) {
  transition: transform 1s 3.04s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(39) {
  transition: transform 1s 3.12s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(40) {
  transition: transform 1s 3.2s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(41) {
  transition: transform 1s 3.28s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(42) {
  transition: transform 1s 3.36s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(43) {
  transition: transform 1s 3.44s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(44) {
  transition: transform 1s 3.52s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(45) {
  transition: transform 1s 3.6s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(46) {
  transition: transform 1s 3.68s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(47) {
  transition: transform 1s 3.76s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(48) {
  transition: transform 1s 3.84s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(49) {
  transition: transform 1s 3.92s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li:nth-child(50) {
  transition: transform 1s 4s cubic-bezier(0.29, 1.4, 0.44, 0.96);
}
input.hamburger:checked ~ .drawer-list li a {
  padding-right: 15px;
}
input.hamburger:checked ~ label > i {
  background-color: transparent;
  transform: rotate(90deg);
}
input.hamburger:checked ~ label > i:before {
  transform: translate(-50%, -50%) rotate(45deg);
}
input.hamburger:checked ~ label > i:after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
input.hamburger:checked ~ label close {
  color: #021112;
  width: 100%;
  right: -20px; // hack
}
input.hamburger:checked ~ label open {
  color: rgba(0, 0, 0, 0);
  width: 0;
}

label.hamburger {
  z-index: 9999;
  position: relative;
  display: block;
  height: 50px;
  width: 50px;
}
label.hamburger:hover {
  cursor: pointer;
}
label.hamburger text close,
label.hamburger text open {
  text-transform: uppercase;
  font-size: 0.8em;
  align-text: center;
  position: absolute;
  transform: translateY(50px);
  text-align: center;
  overflow: hidden;
  transition: width 0.25s 0.35s, color 0.45s 0.35s;
  font-size: initial;
}
label.hamburger text close {
  color: rgba(0, 0, 0, 0);
  right: 0;
  width: 0;
  font-size: initial;
}
label.hamburger text open {
  color: #021112;
  width: 100%;
}
label.hamburger > i {
  position: absolute;
  width: 100%;
  height: 2px;
  top: 50%;
  background-color: #021112;
  pointer-events: auto;
  transition-duration: 0.35s;
  transition-delay: 0.35s;
}
label.hamburger > i:before, label.hamburger > i:after {
  position: absolute;
  display: block;
  width: 100%;
  height: 2px;
  left: 50%;
  background-color: #021112;
  content: "";
  transition: transform 0.35s;
  transform-origin: 50% 50%;
}
label.hamburger > i:before {
  transform: translate(-50%, -14px);
}
label.hamburger > i:after {
  transform: translate(-50%, 14px);
}

label.hamburger {
  position: fixed;
  top: 35px;
  right: 65px;
}

/**
    SCROLLBAR STYLE FOR IE
*/
body {
  scrollbar-base-color: #138a72;
  scrollbar-3dlight-color: #fff;
  scrollbar-highlight-color: #1abc9c;
  scrollbar-track-color: #fff;
  scrollbar-arrow-color: #1abc9c;
  scrollbar-shadow-color: #1abc9c;
  scrollbar-dark-shadow-color: #1abc9c;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

.icon {
  display: inline-block;
  width: 5vw;
  height: 4vw;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
}
` as CSSResultGroup;
}