const KeyStore = require('keystore_wdc');
const ks=new KeyStore();

class Common{
    constructor() {
    }

    async getprikey(keystore,password){
        const prikey = await ks.DecryptSecretKeyfull(keystore,password);
        return prikey;
    }
    
    async getpubkey(keystore,password){
        const pubkey = await ks.keystoreToPubkey(keystore,password);
        return pubkey;
    }

    getpirkeyTopubkey(prikey){
        const pubkey = ks.prikeyToPubkey(prikey);
        return pubkey;
    }

    getpubkeyHash(address){
        const pubkeyHash = ks.addressToPubkeyHash(address);
        return pubkeyHash;
    }

    getkeystore(list,index){
        return list[index];
    }

    checkCountersign(address){
        var undone=global.undone[0];
        for(var y=0;y<undone.pubkeyHashArray.length;y++){
            const add = ks.pubkeyHashToaddress(undone.pubkeyHashArray[y],'1');
            if(add==address){
                return true;
            }
        }
        return false;
    }

    checkCompany(address){
        if(global.undone.length>0){
            var undone=global.undone[0];
            for(var x=0;x<undone.participant.length;x++){
                if(undone.participant[x]==address){
                    if(this.checkCountersign(address)){
                        return false;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    getExistUndone(){
        if(global.undone.length>0){
            return true;
        }
        return false;
    }

    getAddress(index){
        return global.address[index];
    }

    checkTransaction(id){
        var undone=global.undone[0];
        if(undone.id==id){
            if(undone.prikeyArray.length==undone.participant.length){
                return 0;//满足
            }
        }
        return -1;//不满足
    }

    checkExit(id){
        if(global.undone.length>0){
            var undone=global.undone[0];
            if(undone.id==id){
                return true;//存在
            }
        }
        console.log("______>"+global.finish);
        for(var x=0;x<global.finish.length;x++){
            if(global.finish[x].id==id){
                return true;
            }
        }
        return false;//不存在
    }

    getUndone(id){
        if(global.undone.length>0){
            if(global.undone[0].id==id){
                return global.undone[0];
            }
        }
        for(var x=0;x<global.finish.length;x++){
            if(global.finish[x].id==id){
                return global.finish[x];
            }
        }
        return null;
    }

    getParticipantInfo(address){
        var undone=global.undone[0];
        for(var x=0;x<undone.participant.length;x++){
            if(undone.participant[x]==address){
                return undone;
            }
        }
        return null;
    }

    getaddToAddress(address){
        for(var x=0;x<global.address.length;x++){
            if(global.address[x].address==address){
                return global.address[x];
            }
        }
        return null;
    }

    joinUndone(address){
        var address=this.getaddToAddress(address);
        console.log(address);
        var undone=global.undone[0];
        var prikeyArray=undone.prikeyArray;
        prikeyArray.push(address.prikey);
        undone.prikeyArray=prikeyArray;
        var pubkeyArray=undone.pubkeyArray;
        pubkeyArray.push(address.pubkey);
        undone.pubkeyArray=pubkeyArray;
        var pubkeyHashArray=undone.pubkeyHashArray;
        pubkeyHashArray.push(address.pubkeyHash);
        undone.pubkeyHashArray=pubkeyHashArray;
        if(undone.prikeyArray.length==undone.participant.length){
            undone.type=1;
        }
        global.undone[0]=undone;
    }

    UndoneToFinish(height,blockHash){
        var undone=global.undone[0];
        undone.height=height;
        undone.blockHash=blockHash;
        undone.type=3;
        global.finish.push(undone);
        global.undone=[];
    }

    updateUndone(txHash){
        var undone=global.undone[0];
        undone.type=2;
        undone.transHash=txHash;
        global.undone[0]=undone;
    }

    updateTxhash(){
        var undone=global.undone[0];
        undone.transHash=txHash;
        global.undone[0]=undone;
    }

    saveUndone(id,info,text,participant,min){
        var prikeyArray=[];
        prikeyArray.push(global.address[0].prikey);
        var pubkeyArray=[];
        pubkeyArray.push(global.address[0].pubkey);
        var pubkeyHashArray=[];
        pubkeyHashArray.push(global.address[0].pubkeyHash);
        var undone={
            "id":id,
            "info":info,
            "text":text,
            "participant":participant,
            "max":participant.length,
            "min":min,
            "prikeyArray":prikeyArray,
            "pubkeyArray":pubkeyArray,
            "pubkeyHashArray":pubkeyHashArray,
            "height":0,
            "transHash":'',
            "blockHash":'',
            "type":0 //0是未就绪，1是已就绪，2是待确认，3是上链成功
        }
        global.undone[0]=undone;
    }

    getTransaction(nonceNum,payload_m,payload_n,payload_pubkeyHashsArray,fromPubkeysArray,prikeysArray){
        var fromPubkeyStr='e410a6981fc75fa8dd596fad3479489e069862bf7244d645bf58c5c979cac99b';
        var prikeyStr='01309e20d0da8b30be064e3abb13ac020c6b50d08e9feeca84c82e66a31faf1e';
        let payload_asset160hash = "0000000000000000000000000000000000000000";
        let payload_pubkeyHashasBytesArray = new Array();
        for(var i=0;i<payload_pubkeyHashsArray.length;i++){
            payload_pubkeyHashasBytesArray.push(Buffer.from(payload_pubkeyHashsArray[i],'hex'));
        }
        //构建
        let multRule = ks.CreateMultipleForRuleFirst(fromPubkeyStr,nonceNum,prikeyStr,payload_asset160hash,payload_m,payload_n,payload_pubkeyHashasBytesArray);
        //其他人签名
        let signTx = multRule.signTransaction;
        let signAll = "";
        for(var i=1;i<prikeysArray.length;i++){
            let otherMult = ks.CreateMultipleToDeployforRuleOther(multRule.sign,multRule.rawTransaction,fromPubkeyStr,fromPubkeysArray[i],prikeysArray[i]);
            signAll = ks.CreateMultipleForRuleSplice(signTx,otherMult.fromPubkeyStr,otherMult.sign,prikeyStr);
            signTx = signAll.allsignTransaction;
        }  
        
        // console.log(signAll.allsignTransaction);
        // console.log("-------------------------");
        // console.log(signAll.txHash);
        return {
            'transaction':signAll.allsignTransaction,
            'txHash':signAll.txHash
        };
    }

   

}

module.exports = Common;
