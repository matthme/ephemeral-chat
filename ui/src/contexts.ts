import { createContext } from '@lit-labs/context';
import { AppWebsocket, AppInfo } from '@holochain/client';
import { BurnerService } from './burner-service';

export const appWebsocketContext = createContext<AppWebsocket>('appWebsocket');
export const appInfoContext = createContext<AppInfo>('appInfo');
export const burnerServiceContext = createContext<BurnerService>('burner-service');

