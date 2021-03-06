var express = require('express');
var router = express.Router();
const KeyStore = require('keystore_wdc');
const RPC=require('../rpc')
var rpc=new RPC();
const Inherit=require('./Inherit');
var inherit=new Inherit();
const schedule = require('node-schedule');

const  scheduleCronstyle = ()=>{
    //每5秒定时执行一次:
    schedule.scheduleJob('*/5 * * * * *',async function(){
        if(global.inherit.length>0){
          var info=global.inherit[global.inherit.length-1];
          if(info.state==0){
            const t=await rpc.getTransaction(info.transfer.txHash);
            if(t!=null){
                inherit.updateTransfer(t.blockHeight,t.blockHash,info);
                console.log("The forward asset hash: "+info.transfer.txHash+" Chain on the successful");
            }
          }else if(info.state==2){
            const t=await rpc.getTransaction(info.getinfo.txHash);
            if(t!=null){
                inherit.updateGet(t.blockHeight,t.blockHash,info);
                console.log("Get the asset hash："+info.getinfo.txHash+" Chain on the successful");
            }
          }
        }
    }); 
}

scheduleCronstyle();


router.get('/', function(req, res, next) {
    res.render('inherit/index', { from: global.address[0].address ,inter: global.address[1].address, to: global.address[2].address});
})

router.get('/getfrom',async function(req, res, next){
    const height=await rpc.getHeight();
    res.render('inherit/register',{height:height,to:global.address[2].address});
})

router.get('/saveTransfer',async function(req, res, next){
    var name=req.query.name, message=req.query.message, height=req.query.num;
    inherit.saveTransfer(name,message,height); 
    res.render('inherit/savesuccess');
})

router.get('/sendTransfer',async function(req, res, next){
    var transfer=global.inherit[global.inherit.length-1];
    var traninfo=await inherit.sendTransfer(transfer.height);
    var result=await rpc.sendTransaction(traninfo.transaction);
    if(result==1){
        inherit.update(traninfo.txHash);
        res.send(traninfo.txHash);//广播成功
    }else{
        res.send(null);//广播失败
    };  
})

router.get('/getsuccess',function(req, res, next){
    var id=req.query.id;
    if(id==1){
       res.render('inherit/success',{txHash:req.query.txHash,id:id});
    }else{
        res.render('inherit/success',{txHash:req.query.txHash,id:id});
    }  
})

router.get('/getInto',function(req, res, next){
    res.render('inherit/plat',{traninfo:global.inherit[global.inherit.length-1].transfer,to:global.address[2].address});
})

router.get('/checkTransfer',function(req, res, next){
    if(global.inherit.length==0){
        res.send(true);
        return;
    }
    var info=global.inherit[global.inherit.length-1];
    if(info.state==0){
        res.send(false);
    }else{
        res.send(true);
    }
})

router.get('/checkInherit',function(req, res, next){
    if(global.inherit.length==0){
        res.send(true);
    }else{
        res.send(false);
    }
})

router.get('/saveGet',async function(req, res, next){
    var traninfo=await inherit.sendGet();
    var result=await rpc.sendTransaction(traninfo.transaction);
    if(result==1){
        inherit.saveGet(traninfo.txHash);
        res.send(traninfo.txHash);//广播成功
    }else{
        res.send(null);//广播失败
    }
})

router.get('/select',async function(req, res, next){
    var info=global.inherit[global.inherit.length-1];
    res.render('inherit/select',{info:info,to:global.address[2].address});
})

router.get('/updateselect',async function(req, res, next){
    res.send(global.inherit[global.inherit.length-1]);
})

router.get('/switchselect',async function(req, res, next){
    var id=req.query.id;
    if(id==1){//transfer
        res.send(global.inherit[global.inherit.length-1].transfer);
    }else{
        res.send(global.inherit[global.inherit.length-1].getinfo);
    }
})

module.exports = router;
