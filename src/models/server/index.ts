import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { IServerConfig, ITask, IClientMessage, IServerMessageEvent } from '../../interfaces';
import { Worker } from './Worker';
import { makeId } from '../../utils';

export declare interface Server<T> {
  on(event: 'new-worker', listener: (worker: Worker) => void): this;
  on(event: 'message', listener: (event: IServerMessageEvent) => void): this;
  on(event: 'task-finished', listener: (task: ITask<T>) => void): this;
}

export class Server<T = any> extends EventEmitter {
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

  public async process(data: T): Promise<ITask<T>> {
    const worker = this.workers.find(r => r.status === 'ready');
    const _id = makeId(24);
    const result = await worker.sendPayload(data, _id);

    this.emit('task-finished', result);

    return result;
  }
}
