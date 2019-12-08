import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { Server } from '.';
import { IWorkerStatus, IMessage, ITask, IServerMessageEvent } from '../../interfaces';

export class Worker {
  public status: IWorkerStatus = 'ready';

  public taskId: string;

  constructor(public server: Server, public ws: WebSocket, public req: IncomingMessage) {
    this.ws.on('message', this._onMessage);
  }

  protected _onMessage = (message: string) => {
    const { channel, data, _taskId } = JSON.parse(message) as IMessage;

    if (channel !== 'finished') {
      const event: IServerMessageEvent = {
        _taskId,
        worker: this,
        reply: (channel: string, ...args: any[]) => {
          this.send(channel, ...args);
        }
      };

      this.server.emit(channel, event, ...data);
    }
  }

  public sendPayload(data: any, _id: string): Promise<ITask<any>> {
    this.taskId = _id;

    return new Promise((resolve, reject) => {
      if (this.status !== 'ready') {
        return reject('This worker is busy!');
      }

      const onTaskMessage = (message: string) => {
        const { channel, data } = JSON.parse(message) as IMessage;

        if (channel === 'finished') {
          this.status = 'ready';
          this.ws.removeEventListener('message', onTaskMessage as any);

          resolve({ _id, data });
        }
      }

      this.status = 'busy';
      this.ws.on('message', onTaskMessage);
      this.send('payload', ...data);
    });
  }

  public send(channel: string, ...data: any[]) {
    const message: IMessage = { channel, data, _taskId: this.taskId };

    this.ws.send(JSON.stringify(message));
  }
}
