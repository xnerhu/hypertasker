import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { IServerConfig } from '../../interfaces';
import { Worker } from './Worker';

export declare interface Server {
  on(event: 'new-worker', listener: (worker: Worker) => void): this;
  on(event: 'task-finished', listener: (data: any, worker: Worker) => void): this;
}

export class Server extends EventEmitter {
  public workers: Worker[] = [];

  public ws: WebSocket.Server;

  public connect(config: IServerConfig) {
    this.ws = new WebSocket.Server(config);
    this.ws.on('connection', this._onConnection);
  }

  protected _onConnection = (ws: WebSocket, req: IncomingMessage) => {
    const worker = new Worker(this, ws, req);

    this.workers.push(worker);
    this.emit('new-worker', worker);
  }

  public get readyWorkers() {
    return this.workers.filter(r => r.status === 'ready');
  }
}
