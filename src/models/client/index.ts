import { EventEmitter } from 'events';
import WebSocket from 'ws';

import { IClientOptions, IClientMessage, IServerMessage, IWorkerStatus } from '../../interfaces';

export declare interface Client<T> {
  on(event: 'message', listener: (data: IServerMessage) => void): this;
}

export class Client<T = any> extends EventEmitter {
  public status: IWorkerStatus = 'ready';

  public ws: WebSocket;

  public connect(address: string, options?: IClientOptions): Promise<void> {
    return new Promise(resolve => {
      this.ws = new WebSocket(address, options);
      this.ws.once('open', resolve);
      this.ws.on('message', this._onMessage);
    });
  }

  protected _onMessage = (message: string) => {
    const data: IServerMessage = JSON.parse(message);

    if (data.type === 'payload') {
      this.status = 'busy';
    }

    this.emit('message', data);
  }

  public finish(data?: T) {
    if (this.status !== 'busy') {
      throw new Error('This worker has no job!');
    }

    this.status = 'ready';
    this.send({ type: 'finished', data });
  }

  public send(data: IClientMessage) {
    this.ws.send(JSON.stringify(data));
  }

  public sendMessage(message: any) {
    this.send({ type: 'message', data: message });
  }
}
