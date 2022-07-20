import { createContext } from '@lit-labs/context';
import { AppWebsocket, InstalledAppInfo } from '@holochain/client';
import { BurnerStore } from './burner-store';

export const appWebsocketContext = createContext<AppWebsocket>('appWebsocket');
export const appInfoContext = createContext<InstalledAppInfo>('appInfo');
export const burnerStoreContext = createContext<BurnerStore>('burner-store')
