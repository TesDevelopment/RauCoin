import express = require('express');
import bodyParser = require('body-parser')

import { generate_wallet  } from "./wallet/wallet";

import { ledger_class } from "./blockchain/ledger"

import { socket_request, Client } from "./general_types"

import { pack } from "jsonpack";

const base = express();

import init_ws = require('express-ws');

const Ess = init_ws(base);

const { app } = Ess;

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

let client_list: Array<Client> = [];

const ledger = new ledger_class(client_list, __dirname + "/blockchain_backup.json");

app.ws('/v1/chainconnect', function(ws , req) {
    ws.on('message', async function(message: string) {
        const msg = JSON.parse(message);
        switch (msg.type) {
            case "Init_Connection":
                let soul: string;
                let taken: boolean = true;
                do {
                    taken = false
                    soul = (Math.random() + 1).toString(36).substring(7);
                    client_list.forEach(function(client) {
                        if(client.soul == soul){
                            taken = true;
                        }
                    })
                }while(taken)

                ws.send(JSON.stringify({ 
                    type: "Init_Connection_Response",
                    data: {
                        soul: soul
                    }
                }))

                //@ts-ignore
                client_list.push(new Client(soul,msg.wallet_public,msg.intent,ws))
            break;

            case "Request_Block":

                const client = client_list.find(cl => cl.soul == msg.soul)

                if(!client) return;

                const block = await ledger.request_pending_block();


                ws.send(JSON.stringify({
                    type: "Block_Response",
                    data: {
                        block: pack(block.to_json())
                    }
                }))

                client.push_job(block);
            break;

            case "Crack_Block":
                const block_client = client_list.find(cl => cl.soul == msg.soul)

                if(!block_client) return;

                console.log(block_client)
                const job = block_client.get_job(msg.block.soul);

                console.log(job)
                if(!job) return;
                console.log("AFTER")

                if(job.checkhash(msg.hash,msg.previoushash,msg.nonce)){
                    console.log("WLAJEN")
                    ledger.mempool.splice(ledger.mempool.indexOf(job),1);
                    console.log(ledger.mempool)
                    job.complete_check(msg.hash);
                    ledger.update_chain(job)
                }
            break;
        }
    });
});

function verify_payload(payload: any, reqs: Array<string>): (boolean | string) {
    for(const req of reqs){
        if(!payload[req]){
            return req;
        }
    }
    return false;
}

app.get("/v1/authtransaction", (req: express.Request, res: express.Response) => {
    const body = req.body;
    if(verify_payload(body, ["private_key", "receiver", "amount"])){
        return res.json({passed: false, reason: `missing ${verify_payload(body, ["private_key", "receiver", "amount"])}`})
    }

    const private_key = body.private_key;

    const receiver = body.receiver;

    const amount = body.amount;

    const transaction_block = ledger.create_transaction(private_key, receiver, amount);

    //Forcing the block to enter a mined state for testing...
    //transaction_block.status = 1;
    //ledger.update_chain(transaction_block);

    return res.json({passed: true, block_soul: transaction_block.soul, block_difficulty: transaction_block.difficulty})
})

console.log(generate_wallet())
console.log(generate_wallet())

app.listen(80, () => console.log("Listening on port 80"));