export type IWorkerStatus = 'ready' | 'busy';

export interface IClientMessage {
  type?: 'finished' | 'message';
  data?: any;
}

export interface IServerMessage {
  type?: 'payload' | 'message';
  data?: any;
}
