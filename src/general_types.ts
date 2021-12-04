export class chainObj{
    declare type: string;
}

export class InitConnection extends chainObj{
    declare soul: string;
    declare wallet_public: string;
    declare intent: string;
}

export class List_Client{
    constructor(soul: string, wallet_public: string,intent: string,socket: WebSocket){
        this.soul = soul;
        this.wallet_public = wallet_public;
        this.socket = socket;
        this.intent = intent;
    }
    declare soul: string;
    declare wallet_public: string;
    declare socket: WebSocket;
    declare intent: string;
}