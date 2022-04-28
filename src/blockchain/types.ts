import * as crypto from 'crypto';
import { get_public_key } from "../wallet/wallet";

export enum block_status {
    "pending",
    "confirmed"
}

export class Block {
    constructor(difficulty: number, transfer_data : Array<any>) {
        this.difficulty = difficulty
        this.soul = crypto.randomBytes(2000).toString("hex")

        this.transfer_data = {
            wallet: get_public_key(transfer_data[0]),
            receiver: transfer_data[1],
            ammount: transfer_data[2]
        }
    }

    declare soul: string;
    status: block_status = block_status.pending;
    difficulty: number;
    timestarted: number = Date.now();
    hash: string = ""
    declare transfer_data: Object

    checkhash(hash: string, previoushash: string, nonce: number){
        if(hash.startsWith("0".repeat(this.difficulty))){
            return crypto.createHash("sha256").update(this.soul + this.timestarted + previoushash + nonce).digest("hex") == hash;
        }
        return false;
    }

    complete_check(hash: string){
        this.status = block_status.confirmed
        this.hash = hash
    }

    to_json(){
        return {
            soul: this.soul,
            status: this.status,
            difficulty: this.difficulty,
            timestarted: this.timestarted,
            hash: this.hash,
            nonce: 0,
            transfer_data: this.transfer_data
        }
    }
}

export class BlockChain_File {
    data: Object = {
        blocks: []
    };
}