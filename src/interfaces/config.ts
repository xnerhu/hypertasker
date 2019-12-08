import { ServerOptions, ClientOptions } from 'ws';

export interface IServerConfig extends ServerOptions {
  packetSize?: number;
}

export type IClientOptions = ClientOptions
