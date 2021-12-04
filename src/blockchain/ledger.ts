import { List_Client } from "../general_types"

import { Block, BlockChain_File } from "./types"

module.exports = class {
    constructor(socket_list: List_Client[], backup: string) { 
        this.backup_file = require(backup);
        this.socket_list = socket_list;
    }
    backup_file: BlockChain_File
    socket_list: List_Client[]

    update_socket(new_list: List_Client[]): void {
        this.socket_list = new_list
    }

    update_chain(block: Block): void {
        this.backup_file.data.push(block)

        this.socket_list.forEach(socket => {
            socket.socket.send(JSON.stringify({
                type:'new_block',
                data: {
                    block: block
                }
            }));
        })
    }

    update_block(block: Block): void {
        let update_block = this.backup_file.data.find(current_block => current_block.soul == block.soul)

        this.backup_file.data.map(current_block => {
            if(current_block != update_block) {
                return current_block
            }
        })

        update_block = block

        this.backup_file.data.push(update_block)

        this.socket_list.forEach(socket => {
            socket.socket.send(JSON.stringify({
                type:'block_update',
                data: {
                    soul: block.soul,
                    update: block
                }
            }));
        })
    }

    /*
    TODO: This
    request_pending_block(): Block {

    }
    */

}
