import { css, html, LitElement } from 'lit';
import { contextProvider } from '@lit-labs/context';
import { property } from 'lit/decorators.js';

import { burnerServiceContext } from '../contexts';
import { BurnerService } from '../burner-service';

export class BurnerServiceContext extends LitElement {
  @contextProvider({ context: burnerServiceContext })

  @property({ type: Object })
  service!: BurnerService;

  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: contents;
    }
  `;
}