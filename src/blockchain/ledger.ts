import { Client } from "../general_types"

import { Block, BlockChain_File, block_status } from "./types"

import { existsSync, writeFileSync } from "fs";

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
            console.log("Updating chain...")
            writeFileSync(backup, JSON.stringify(this.backup_file));
        }, 30000);
    }

    backup_file: BlockChain_File
    socket_list: Array<Client>
    mempool: Array<Block> = []

    update_socket(new_list: Client[]): void {
        this.socket_list = new_list
    }

    update_chain(block: Block): void {
        //@ts-ignore
        this.backup_file.blocks.push(block.to_json());

        this.socket_list.forEach(socket => {
            socket.socket.send(JSON.stringify({
                type:'new_block',
                data: {
                    block: block
                }
            }));
        })
    }


    //TODO: Add difficulty scaling
    create_transaction(key: string, receiver: string, ammount: number): Block {
        const new_block = new Block(1, [key, receiver, ammount]);
        new_block.status = block_status.pending;

        this.mempool.push(new_block);
        return new_block;
    }


    request_pending_block(): Block  {
        return this.mempool[Math.random() * this.mempool.length];
    }

}
