const KeyStore = require('keystore_wdc');
const ks=new KeyStore();
const RPC=require('../rpc')
var rpc=new RPC();

class Inherit{
    constructor() {
    }

    async sendTransfer(height){
        var from=global.address[0];
        var nonce=await rpc.getNonce();
        var traninfo=ks.CreateHashHeightBlockTransferForDeploy(from.pubkey,"c390681221b2d2d9f248325540d17b1aa351f595",nonce,from.prikey,1000,'123456789',height);
        return traninfo;
    }

    saveTransfer(name,message,height,txHash){
        // this.checkTransferState();
        var transfer={
            'name':name,
            'message':message,
            'height':height,
            'txHash':txHash,
            'blockHash':'',
            'blockheight':0
        };
        var info={
            'state':0,//0是转账没上链，1是转账上链，2是获取没上链，3是获取上链
            'transfer':transfer,
            'getinfo':null
        };
        global.inherit.push(info);
    }

    checkTransferState(){
        if(global.inherit.length>0){
            var info=global.inherit[global.inherit.length-1];
            if(info.state==0){
                global.inherit.pop();
            }
        }
    }
   
    updateTransfer(height,blockHash,info){
        var transfer=info.transfer;
        transfer.blockHash=blockHash;
        transfer.blockheight=height;
        info.transfer=transfer;
        info.state=1;
        global.inherit[global.inherit.length-1]=info;
    }

    updateGet(height,blockHash,info){
        var getinfo=info.getinfo;
        getinfo.blockheight=height;
        getinfo.blockHash=blockHash;
        info.getinfo=getinfo;
        info.state=3;
        global.inherit[global.inherit.length-1]=info;
    }

    saveGet(txHash){
        var info=global.inherit[global.inherit.length-1];
        var getinfo={
            'txHash':txHash,
            'blockheight':0,
            'blockHash':''
        };
        info.state=2;
        info.getinfo=getinfo;
        global.inherit[global.inherit.length-1]=info;
    }

    async sendGet(){
        var to=global.address[1];
        var nonce=await rpc.getNoncePubkeyHash(to.pubkeyHash);
        var txHash=global.inherit[global.inherit.length-1].transfer.txHash;
        var traninfo=ks.CreateHashHeightBlockGetForDeploy(to.pubkey,"c390681221b2d2d9f248325540d17b1aa351f595",nonce,to.prikey,txHash,'123456789');
        return traninfo;
    }
}

module.exports = Inherit;
