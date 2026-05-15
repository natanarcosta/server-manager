export type ServerStatus =
  | 'offline'
  | 'starting'
  | 'online'
  | 'stopping'
  | 'updating'
  | 'backing_up'
  | 'crashed';
