declare module 'gamedig' {
  interface Player {
    name: string;
    raw?: any;
  }

  interface QueryResult {
    name: string;
    map: string;
    password: boolean;
    numplayers: number;
    maxplayers: number;
    players: Player[];
    bots: Player[];
    connect: string;
    ping: number;
    raw?: any;
  }

  interface QueryOptions {
    type: string;
    host: string;
    port: number;
    maxRetries?: number;
    socketTimeout?: number;
    attemptTimeout?: number;
    givenPortOnly?: boolean;
  }

  const GameDig: {
    query(options: QueryOptions): Promise<QueryResult>;
  };

  export default GameDig;
}
