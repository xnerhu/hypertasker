import { Worker } from '../models/server/worker';

export type IWorkerStatus = 'ready' | 'busy';

export interface IClientMessage {
  type?: 'finished' | 'message';
  data?: any;
}

export interface IServerMessage {
  type?: 'payload' | 'message';
  _taskId?: string;
  data?: any;
}

export interface IServerMessageEvent {
  worker?: Worker;
}
