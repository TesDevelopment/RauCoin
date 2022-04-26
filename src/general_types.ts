import { Block } from "./blockchain/types";

export class socket_request{
    declare type: string;
    declare soul: string
    declare wallet_public: string;
    declare intent: string;
    declare block: Block;
    declare hash: string;
    declare nonce: number;
    declare previoushash: string;
}

export class Client{
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
    job_list: Array<Block> = [];

    push_job(job: Block){
        this.job_list.push(job);
    }

    get_job(soul: string){
        for(let i = 0; i < this.job_list.length; i++){
            if(this.job_list[i].soul == soul){
                return this.job_list[i];
            }
        }
        return null;
    }

    pop_job(soul: string){

    }
}

