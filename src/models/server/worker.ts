import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { Server } from '.';
import { IWorkerStatus, IServerMessage, IClientMessage } from '../../interfaces';

let _id = 0;

export class Worker {
  public id = _id++;

  public status: IWorkerStatus = 'ready';

  constructor(protected server: Server, protected ws: WebSocket, protected req: IncomingMessage) {
    this.ws.on('message', this._onMessage);
  }

  protected _onMessage = (message: string) => {
    const { type, data } = JSON.parse(message) as IClientMessage;

    if (type === 'finished') {
      this.status = 'ready';
      this.server.emit('task-finished', data, this);
    }
  }

  public process(data: any) {
    if (this.status !== 'ready') {
      throw new Error('This worker is busy!');
    }

    this.status = 'busy';
    this._sendPayload(data);
  }

  protected _sendPayload(data: any) {
    const message: IServerMessage = { type: 'payload', data };
    this.ws.send(JSON.stringify(message));
  }
}
