import { Worker } from '../models/server/worker';

export type IWorkerStatus = 'ready' | 'busy';

export interface IMessage {
  data?: any;
  _taskId?: string;
  channel?: string;
}

export interface IMessageEvent {
  reply?: (channel: string, ...args: any[]) => void;
}

export interface IClientMessageEvent extends IMessageEvent {
  _taskId?: string;
}

export interface IServerMessageEvent extends IClientMessageEvent {
  worker?: Worker;
}

export interface IServerFinishEvent {
  _taskId?: string;
  worker?: Worker;
}
