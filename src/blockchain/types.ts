export enum block_status {
    "pending",
    "distributed",
    "confirmed",
    "rejected"
}

export class Block {
    constructor(difficulty: number) {
        
    }
    declare soul: string;
    status: block_status = block_status.pending;
}

export class BlockChain_File {
    declare data: Block[];
}