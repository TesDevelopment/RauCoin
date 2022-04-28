import { Client } from "../general_types"

import { Block, BlockChain_File, block_status } from "./types"

import { existsSync, writeFileSync, readdirSync } from "fs";

//For next push
import { pack } from "jsonpack";

//Ammount of rau in circulation
const stock = 20000000

export class ledger_class {
    constructor(socket_list: Client[], backup: string) { 
        if(!existsSync(backup)) {
            writeFileSync(backup, JSON.stringify({
                blocks: [
                    {
                        soul: 'origin',
                        status: block_status.confirmed,
                        difficulty: 1,
                        timestarted: 1651014060095,
                        hash: "0000000000000000000000000000000000000000000000000000000000000000",
                        nonce: 0,
                        transfer_data: {
                            "wallet": "origin",
                            "receiver": "origin",
                            "ammount": stock
                        }
                    }
                ]
            }))
        }
        this.backup_file = require(backup);
        this.socket_list = socket_list;

        setInterval(() => {
            console.log("Updating emergancy backup chain...")
            writeFileSync(backup, JSON.stringify(this.backup_file));
        }, 30000);
    }

    backup_file: BlockChain_File
    ledger_folder: string = __dirname + "\\..\\..\\ledger\\";
    socket_list: Array<Client>
    mempool: Array<Block> = []
    pend_list: Array<(value: Block | PromiseLike<Block>) => void> = []

    update_socket(new_list: Client[]): void {
        this.socket_list = new_list
    }

    update_chain(block: Block): void {
        const out_data = pack(block.to_json())

        writeFileSync(`${this.ledger_folder}${block.soul.slice(0,5)}-${block.soul.slice(block.soul.length - 5, block.soul.length)}.block`, out_data);
        //@ts-ignore
        this.backup_file.blocks.push(block.to_json());

        this.socket_list.forEach(socket => {
            socket.socket.send(JSON.stringify({
                type:'new_block',
                data: {
                    block: out_data
                }
            }));
        })
    }


    //TODO: Add difficulty scaling
    create_transaction(key: string, receiver: string, ammount: number): Block {
        const new_block = new Block(1, [key, receiver, ammount]);
        new_block.status = block_status.pending;

        console.log(`Created new block`)

        for(const resolve of this.pend_list) {
            resolve(new_block);
        }

        this.mempool.push(new_block);
        return new_block;
    }


    request_pending_block(): Promise<Block>  {
        return new Promise((resolve, reject) => {
            if(this.mempool.length != 0) {
                resolve(this.mempool[Math.floor(Math.random() * this.mempool.length)]);
                return;
            }
            this.pend_list.push(resolve);
        })
    }

}
