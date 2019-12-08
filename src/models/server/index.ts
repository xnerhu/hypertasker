import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { IServerConfig, ITask, IServerMessageEvent, IServerFinishEvent } from '../../interfaces';
import { Worker } from './worker';
import { makeId } from '../../utils';

export declare interface Server<T> {
  on(event: string, listener: (event: IServerMessageEvent, ...args: any[]) => void): this;
  on(event: 'finished', listener: (event: IServerFinishEvent, ...args: any[]) => void): this;
  on(event: 'new-worker', listener: (worker: Worker) => void): this;
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

    const event: IServerFinishEvent = { _taskId: _id, worker };

    this.emit('finished', event, ...result.data);

    return result;
  }

  public send(channel: string, ...data: any[]) {
    this.workers.forEach(r => {
      r.send(channel, ...data);
    });
  }
}
