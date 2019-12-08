import { EventEmitter } from 'events';
import WebSocket from 'ws';

import { IClientOptions, IClientMessage, IServerMessage, IWorkerStatus } from '../../interfaces';

export declare interface Client {
  on(event: 'message', listener: (message: IServerMessage) => void): this;
}

export class Client extends EventEmitter {
  protected _status: IWorkerStatus = 'ready';

  protected _ws: WebSocket;

  public connect(address: string, options?: IClientOptions) {
    this._ws = new WebSocket(address, options);
    this._ws.on('message', this._onMessage);
  }

  protected _onMessage = (message: string) => {
    const data = JSON.parse(message) as IServerMessage;

    if (data.action === 'data') {
      this._status = 'busy';
    }

    this.emit('message', data);
  }

  public finished(data?: any) {
    if (this._status !== 'busy') {
      throw new Error('This worker has no job!');
    }

    const message: IClientMessage = { action: 'finished', data };

    this._ws.send(JSON.stringify(message));
    this._status = 'ready';
  }
}