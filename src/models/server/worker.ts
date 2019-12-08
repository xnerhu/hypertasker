import WebSocket from 'ws';
import { IncomingMessage } from 'http';

import { Server } from '.';
import { IWorkerStatus, IServerMessage, IClientMessage, ITask, IServerMessageEvent } from '../../interfaces';

export class Worker {
  public status: IWorkerStatus = 'ready';

  constructor(public server: Server, public ws: WebSocket, public req: IncomingMessage) {
    this.ws.on('message', this._onMessage);
  }

  protected _onMessage = (message: string) => {
    const data = JSON.parse(message) as IClientMessage;

    if (data.type === 'message') {
      const event: IServerMessageEvent = {
        worker: this,
        reply: () => {

        }
      };


      // this.server.emit('message', str, data, this);

      // console.log(str);
    }
  }

  public sendPayload(data: any, _id: string): Promise<ITask<any>> {
    return new Promise((resolve, reject) => {
      if (this.status !== 'ready') {
        return reject('This worker is busy!');
      }

      const onTaskMessage = (message: string) => {
        const { type, data } = JSON.parse(message) as IClientMessage;

        if (type === 'finished') {
          this.status = 'ready';
          this.ws.removeEventListener('message', onTaskMessage as any);

          resolve({ _id, data });
        }
      }

      this.ws.on('message', onTaskMessage);
      this.status = 'busy';
      this.send({ type: 'payload', data, _taskId: _id });
    });
  }

  public send(data: IServerMessage) {
    this.ws.send(JSON.stringify(data));
  }

  public sendMessage(message: string) {
    this.send({ type: 'message', data: message });
  }
}
