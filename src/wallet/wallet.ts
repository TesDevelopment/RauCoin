import * as crypto from 'crypto';

class wallet {
    declare public_key: string;
    declare private_key: string;
}

export function generate_wallet(): wallet {
    const salt = "Rau";
    
    let private_key = (1 + 20^110).toString(16);

    private_key = crypto.pbkdf2Sync(crypto.randomBytes(Math.random() * (20^110)), salt, 10000, 32, "sha256").toString('hex');
    
    const public_starter = crypto.createHash("sha256").update(salt + private_key).digest('hex');

    const public_key = public_starter.slice(public_starter.length - (public_starter.length / 2)) +  crypto.createHash("sha256").update(salt + parseInt(public_starter,16).toString().slice(public_starter.length - (public_starter.length / 2))).digest("hex");

    return {public_key: public_key,private_key: private_key};
}

export function get_public_key(private_key: string): string {
    const salt = "Rau"
    const public_starter = crypto.createHash("sha256").update(salt + private_key).digest('hex');

    const public_key = public_starter.slice(public_starter.length - (public_starter.length / 2)) +  crypto.createHash("sha256").update(salt + parseInt(public_starter,16).toString().slice(public_starter.length - (public_starter.length / 2))).digest("hex");
    
    return public_key;
}

export function get_balance(public_key: string): number {
    
    return 0;
}