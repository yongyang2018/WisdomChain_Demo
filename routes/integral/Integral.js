const KeyStore = require('keystore_wdc');
const ks=new KeyStore();
const RPC=require('../rpc')
var rpc=new RPC();

class Integral{
    constructor() {
    }

    async sendTransfer(from,amount,topubkeyHash){
        var nonce=await rpc.getNoncePubkeyHash(from.pubkeyHash);
        var traninfo=ks.CreateSignToDeployforRuleTransfer(from.pubkey,"8a7135a155b0ae6948edf54366631f993d4bc29d",nonce,from.prikey,from.pubkey,topubkeyHash,amount);
        return traninfo;
    }

    checkAmount(amount){
        var info=global.integral[global.integral.length-1];
        if(parseInt(amount)>parseInt(info.balance)){
            return true;
        }else{
            return false;
        }
    }

    saveHotel(name,card,hotelname,amount,txHash){
        if(global.integral.length>0){
            var info=global.integral[global.integral.length-1];
            if(info.state<=1){
                global.integral.pop();
            }
        }
        var hotel={
            'name':name,
            'card':card,
            'hotelname':hotelname,
            'amount':amount,
            'txHash':txHash,
            'blockheight':0,
            'blockHash':''
        }
        var info={
            'state':0,//0是酒店未上链，1是酒店已上链，2是景点未上链，3是景点已上链
            'balance':0,
            'hotel':hotel,
            'sights':null
        }
        global.integral.push(info);
    }

    saveSights(name,activity,time,amount,txHash){
        var info=global.integral[global.integral.length-1];
        var sights={
            'name':name,
            'activity':activity,
            'time':time,
            'amount':amount,
            'txHash':txHash,
            'blockheight':0,
            'blockHash':''
        };
        info.sights=sights;
        info.state=2;
        global.integral[global.integral.length-1]=info;
    }

    updateHotel(blockheight,blockHash){
        var info=global.integral[global.integral.length-1];
        var hotel=info.hotel;
        hotel.blockheight=blockheight;
        hotel.blockHash=blockHash;
        info.hotel=hotel;
        info.state=1;
        info.balance=hotel.amount;
        global.integral[global.integral.length-1]=info;
    }

    updateSights(blockheight,blockHash){
        var info=global.integral[global.integral.length-1];
        var sights=info.sights;
        sights.blockheight=blockheight;
        sights.blockHash=blockHash;
        info.state=3;
        var balance=parseInt(info.balance);
        balance-=parseInt(sights.amount);
        info.balance=balance;
        global.integral[global.integral.length-1]=info;
    }
}

module.exports = Integral;
