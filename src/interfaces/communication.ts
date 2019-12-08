export type IWorkerStatus = 'ready' | 'busy';

export interface IClientMessage {
  action?: 'finished';
  data?: any;
}

export interface IServerMessage {
  action?: 'data';
  data?: any;
}
