import { css } from 'lit';
import "@fontsource/roboto-mono";
import "@fontsource/rubik";

export const sharedStyles = css`
  .rubik {
    font-family: Rubik;
  }
  .roboto-mono {
    font-family: Roboto Mono;
  }
  .column {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: row;
  }
  .flex-scrollable-parent {
    position: relative;
    display: flex;
    flex: 1;
  }

  .flex-scrollable-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .flex-scrollable-x {
    max-width: 100%;
    overflow-x: auto;
  }
  .flex-scrollable-y {
    max-height: 100%;
    overflow-y: auto;
  }
`;
