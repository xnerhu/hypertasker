import { EventEmitter } from 'events';
import WebSocket from 'ws';

import { IClientOptions, IMessage, IWorkerStatus, IClientMessageEvent } from '../../interfaces';

export declare interface Client {
  on(event: 'payload', listener: (event: IClientMessageEvent, ...args: any[]) => void): this;
  on(event: string, listener: (event: IClientMessageEvent, ...args: any[]) => void): this;
}

export class Client extends EventEmitter {
  public taskId: string;

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
    const { channel, _taskId, data } = JSON.parse(message) as IMessage;

    if (channel === 'payload') {
      this.status = 'busy';
      this.taskId = _taskId;
    }

    const event: IClientMessageEvent = {
      _taskId,
      reply: (channel: string, ...args: any[]) => {
        this.send(channel, ...args);
      }
    };

    this.emit(channel, event, ...data);
  }

  public finish(data?: any) {
    if (this.status !== 'busy') {
      throw new Error('This worker has no job!');
    }

    this.status = 'ready';
    this.send('finished', ...data);
  }

  public send(channel: string, ...data: any[]) {
    const message: IMessage = { channel, data, _taskId: this.taskId };

    this.ws.send(JSON.stringify(message));
  }
}
