import express = require('express');
import bodyParser = require('body-parser')

import { get_public_key } from "./wallet/wallet";

import { chainObj, List_Client, InitConnection } from "./general_types"

const base = express();

import init_ws = require('express-ws');

const Ess = init_ws(base);

const { app } = Ess;

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())


let client_list: List_Client[] = [];

app.ws('/v1/chainconnect', function(ws , req) {
    ws.on('message', function(msg: chainObj) {

        switch (msg.type) {
            case "Init_Connection":

                // Quick type re-assignment for development
                //TODO: remove from psuedo-production build
                //@ts-ignore
                const message: InitConnection = msg;

                let soul: string;
                let taken: boolean;
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
                    type: "InitConnection_Response",
                    data: {
                        soul: soul
                    }
                }))

                //@ts-ignore
                client_list.push(new List_Client(soul,message.wallet_public,message.intent,ws))
            break;

            case "Request_Block":
                
            break;
        }
    });
});

app.get("/v1/authtransaction", (req: express.Request, res: express.Response) => {
    const body = req.body;

    const privateKey = body.privateKey;
    const publicKey = get_public_key(privateKey);

    const receiver = body.receiver;
    
})