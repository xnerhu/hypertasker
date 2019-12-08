import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { IServerConfig } from '../../interfaces';
import { Worker } from './Worker';

export declare interface Server {
  on(event: 'new-worker', listener: (worker: Worker) => void): this;
  on(event: 'task-finished', listener: (worker: Worker) => void): this;
}

export class Server extends EventEmitter {
  public packetSize: number;

  public workers: Worker[] = [];

  public ws: WebSocket.Server;

  protected _chunks = new Array<any>();

  protected _assigned = 0;

  public connect(config: IServerConfig) {
    this.ws = new WebSocket.Server(config);
    this.ws.on('connection', this._onConnection);

    this.packetSize = config.packetSize || 1;
  }

  protected _onConnection = (ws: WebSocket, req: IncomingMessage) => {
    const worker = new Worker(this, ws, req);

    this.workers.push(worker);
    this.emit('new-worker', worker);
  }

  public pushData(...chunks: any[]) {
    this._chunks.push(...chunks);
  }

  protected _assignChunks() {
    const start = this._assigned;
    const end = Math.min(start + this.packetSize, this._chunks.length);

    this._assigned = Math.min(end, this._chunks.length);

    return this._chunks.slice(start, end);
  }

  public process() {
    const workers = this.workers.filter(r => r.status === 'ready');

    workers.forEach(r => {
      const chunks = this._assignChunks();

      r.process(chunks);
    });
  }
}
