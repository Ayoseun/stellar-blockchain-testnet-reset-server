import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
import {Server,Keypair,Asset,TransactionBuilder,Operation,Memo,LiquidityPoolAsset,getLiquidityPoolId,LiquidityPoolFeeV18} from "stellar-sdk";
const optsopt = {
    'allowHttp': true,
};
const server = new Server(process.env.HORIZON, optsopt);

console.log("Setting up accounts");
try {
    await axios.get(process.env.BOTURL+"/?addr="+process.env.ISSUER_PUB);
    console.log("Issuer account setup done")
} catch (error) {
    if(error.response.data.status==400){
        console.log("Issuer account setup done")
    }else{
        console.log("Issuer account setup failed")
    }
}

try {
    await axios.get(process.env.BOTURL+"/?addr="+process.env.DIST_PUB);
    console.log("distributor account setup done")
} catch (error) {
    if(error.response.data.status==400){
        console.log("distributor account setup done")
    }else{
        console.log("distributor account setup failed")
    }
}

try {
    await axios.get(process.env.BOTURL+"/?addr="+process.env.POOL_PUB);
    console.log("pool account setup done")
} catch (error) {
    if(error.response.data.status==400){
        console.log("pool account setup done")
    }else{
        console.log("pool account setup failed")
    }
}

console.log("creating asset trustline");
try {
    const acc = await server.loadAccount(process.env.DIST_PUB);
    const sourceKeypair = Keypair.fromSecret(process.env.DIST_SECRET);
    const fee = 15000;
    const assets = new Asset(process.env.ASSET, process.env.ISSUER_PUB);
    const asobj = {
            asset: assets,
            source: ''
        };

    //build the tx
    const transaction = new TransactionBuilder(acc, {
        fee,
        networkPassphrase:process.env.NETWORK_PASSPHRASE
    }).addOperation(Operation.changeTrust(asobj))
        .addOperation(Operation.setOptions({homeDomain:process.env.DOMAIN}))
        .setTimeout(90).build();

    transaction.sign(sourceKeypair);
    const memocheck = {
        'skipMemoRequiredCheck': true
    };
    await server.submitTransaction(transaction, memocheck);
} catch (error) {
    console.log(error);
}

console.log("pool trustline");
try {
    const acc = await server.loadAccount(process.env.POOL_PUB);
    const sourceKeypair = Keypair.fromSecret(process.env.POOL_SECRET);
    const fee = 15000;
    const assets = new Asset(process.env.ASSET, process.env.ISSUER_PUB);
    const asobj = {
            asset: assets,
            source: ''
        };

    //build the tx
    const transaction = new TransactionBuilder(acc, {
        fee,
        networkPassphrase:process.env.NETWORK_PASSPHRASE
    }).addOperation(Operation.changeTrust(asobj))
        .addOperation(Operation.setOptions({homeDomain:process.env.DOMAIN}))
        .setTimeout(90).build();

    transaction.sign(sourceKeypair);
    const memocheck = {
        'skipMemoRequiredCheck': true
    };
    await server.submitTransaction(transaction, memocheck);
} catch (error) {
    console.log(error);
}

console.log("asset issuance");
try {
    const acc = await server.loadAccount(process.env.ISSUER_PUB);
    const sourceKeypair = Keypair.fromSecret(process.env.ISSUER_SECRET);
    const fee = 15000;
    const assets = new Asset(process.env.ASSET, process.env.ISSUER_PUB);
    const payobj = { destination: process.env.DIST_PUB, asset: assets, amount: "10000000" };
    const payobj2 = { destination: process.env.POOL_PUB, asset: assets, amount: "50000" };

    //build the tx
    const transaction = new TransactionBuilder(acc, {
        fee,
        networkPassphrase:process.env.NETWORK_PASSPHRASE
    }).addOperation(Operation.payment(payobj))
        .addOperation(Operation.payment(payobj2))
        .addOperation(Operation.setOptions({homeDomain:process.env.DOMAIN}))
        .setTimeout(90).build();

    transaction.sign(sourceKeypair);
    const memocheck = {
        'skipMemoRequiredCheck': true
    };
    await server.submitTransaction(transaction, memocheck);
} catch (error) {
    console.log(error);
}


console.log("creating USDO<>XLM pool");
let poolId;
const assetA = new Asset("XLM");
const assetB = new Asset(process.env.ASSET, process.env.ISSUER_PUB);

const poolShareAsset = new LiquidityPoolAsset(
    assetA,
    assetB,
    LiquidityPoolFeeV18,
    );
    
poolId=getLiquidityPoolId("constant_product",
    poolShareAsset.getLiquidityPoolParameters(),
).toString("hex");

console.log({poolId:poolId});
const obj={asset:poolShareAsset};

try {
    const acc = await server.loadAccount(process.env.POOL_PUB);
    const sourceKeypair = Keypair.fromSecret(process.env.POOL_SECRET);
    const fee = 15000;
    const mtxt = "generte pool";
    const memo = new Memo("text",mtxt);

    //build the tx
    const transaction = new TransactionBuilder(acc, { fee, memo,networkPassphrase:process.env.NETWORK_PASSPHRASE })
        .addOperation(Operation.changeTrust(obj))
        .setTimeout(120).build();
    transaction.sign(sourceKeypair);
    const memocheck = {
        'skipMemoRequiredCheck': true
    };
    await server.submitTransaction(transaction, memocheck);
} catch (error) {
    console.log(error);
}

console.log("creating USDO<>XLM pool initial deposit");
const minPrice = 0.1;
const maxPrice = 10;

try {
    const acc = await server.loadAccount(process.env.POOL_PUB);
    const sourceKeypair = Keypair.fromSecret(process.env.POOL_SECRET);
    const fee = 15000;
    const mtxt = "pool deposit";
    const memo = new Memo("text",mtxt);
    const obj={
        liquidityPoolId:poolId,
        maxAmountA: "8000",
        maxAmountB: "1000",
        minPrice: minPrice,
        maxPrice: maxPrice
      };

      //build the tx
    const transaction = new TransactionBuilder(acc, { fee, memo,networkPassphrase:process.env.NETWORK_PASSPHRASE })
    .addOperation(Operation.liquidityPoolDeposit(obj))
    .setTimeout(120).build();
    transaction.sign(sourceKeypair);
    const memocheck = {
        'skipMemoRequiredCheck': true
    };
    await server.submitTransaction(transaction, memocheck);

} catch (error) {
    console.log(error);
}