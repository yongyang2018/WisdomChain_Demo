var express = require('express');
var router = express.Router();
const KeyStore = require('keystore_wdc');
const RPC=require('../rpc')
var rpc=new RPC();
const schedule = require('node-schedule');
const Integral=require('./Integral');
var integral=new Integral();

const  scheduleCronstyle = ()=>{
    //每5秒定时执行一次:
    schedule.scheduleJob('*/5 * * * * *',async function(){
        if(global.integral.length>0){
          var info=global.integral[global.integral.length-1];
          if(info.state==0){
            const t=await rpc.getTransaction(info.hotel.txHash);
            if(t!=null){
                integral.updateHotel(t.blockHeight,t.blockHash);
                console.log("Hotels issue bonus points: "+info.hotel.txHash+" Chain on the successful");
            }
          }else if(info.state==2){
            const t=await rpc.getTransaction(info.sights.txHash);
            if(t!=null){
                integral.updateSights(t.blockHeight,t.blockHash);
                console.log("Scenic spot consumption points: "+info.sights.txHash+" Chain on the successful");
            }
          }
        }
    }); 
}

scheduleCronstyle();


router.get('/', function(req, res, next) {
    res.render('integral/index', { from: global.address[0].address ,scenic: global.address[1].address, to: global.address[2].address});
})

router.get('/getHotel', function(req, res, next) {
    res.render('integral/hotel');
})

router.get('/sendHotel',async function(req, res, next) {
    var name=req.query.name, card=req.query.card, hotelname=req.query.hotelname, amount=req.query.amount;
    var traninfo=await integral.sendTransfer(global.address[0],amount,global.address[1].pubkeyHash);
    var result=await rpc.sendTransaction(traninfo.transaction);
    if(result==1){
      integral.saveHotel(name,card,hotelname,amount,traninfo.txHash);
      res.send(traninfo.txHash);//广播成功
    }else{
      res.send(null);//广播失败
    };
})

router.get('/getsuccess',function(req, res, next) {
    var id=req.query.id;
    var txHash=req.query.txHash;
    res.render('integral/success',{id:id,txHash:txHash});
})

router.get('/getSights',function(req, res, next) {
    res.render('integral/sights');
})

router.get('/checkSights',function(req, res, next) {
    var info = global.integral[global.integral.length-1];
    var amount=req.query.amount;
    if(info.state==1){
      if(integral.checkAmount(amount)){
        res.send('0');//积分余额不足
      }else{
        res.send('1');
      }
    }else{
      res.send('-1');
    }
})

router.get('/sendSights',async function(req, res, next) {
    var name=req.query.name, activity=req.query.activity, time=req.query.time, amount=req.query.amount;
    var traninfo=await integral.sendTransfer(global.address[1],amount,global.address[2].pubkeyHash);
    var result=await rpc.sendTransaction(traninfo.transaction);
    if(result==1){
      integral.saveSights(name,activity,time,amount,traninfo.txHash);
      res.send(traninfo.txHash);//广播成功
    }else{
      res.send(null);//广播失败
    };
})

router.get('/checkHotel',function(req, res, next){
  if(global.integral.length==0){
      res.send(true);
      return;
  }
  var info=global.integral[global.integral.length-1];
  if(info.state<2){
      res.send(false);
  }else{
      res.send(true);
  }
})

router.get('/checkSelect',function(req, res, next){
    if(global.integral.length>0){
      res.send(true);
    }else{
      res.send(false);
    }
})

router.get('/getSelect',function(req, res, next){
  res.render('integral/select',{integral:global.integral[global.integral.length-1]});
})

router.get('/switchSelect',function(req, res, next){
  var id=req.query.id;
  if(id==1){
    res.send(global.integral[global.integral.length-1]);
  }else{
    res.send(global.integral[global.integral.length-1]);
  }
})

module.exports = router;
