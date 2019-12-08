import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { Server } from '.';
import { IWorkerStatus, IServerMessage, IClientMessage } from '../../interfaces';

export class Worker {
  public status: IWorkerStatus = 'ready';

  constructor(protected _server: Server, protected _ws: WebSocket, protected _req: IncomingMessage) {
    this._ws.on('message', this._onMessage);
  }

  protected _onMessage(message: string) {
    const { action, data } = JSON.parse(message);

    if (action === 'finished') {
      this.status = 'ready';
    }
  }

  public process(data: any[]) {
    if (this.status !== 'ready') {
      throw new Error('This worker is busy!');
    }

    this.status = 'busy';

    const message: IServerMessage = { action: 'data', data };

    this._ws.send(JSON.stringify(message));
  }
}
