var express = require('express');
var router = express.Router();
const KeyStore = require('keystore_wdc');
const Common=require('./Common');
var common=new Common();
const RPC=require('../rpc')
var rpc=new RPC();
const random=require('string-random');
const schedule = require('node-schedule');

var list=[];

const  scheduleCronstyle = ()=>{
    //每5秒定时执行一次:
    schedule.scheduleJob('*/5 * * * * *',async function(){
        if(global.undone.length>0){
          var undone=global.undone[0];
          if(undone.type==2){//待确认
            const t=await rpc.getTransaction(undone.transHash);
            if(t!=null){
              common.UndoneToFinish(t.blockHeight,t.blockHash);
              console.log(undone.transHash+" 上链成功");
            }
          }
        }
    }); 
}

scheduleCronstyle();

router.get('/', function(req, res, next) {
  var id='';
  if(common.getExistUndone()){
    id=global.undone[0].id;
  }
  res.render('countersign/index', { id:id,from: global.address[0].address ,companyA: global.address[1].address, companyB: global.address[2].address,companyC: global.address[3].address});
});

router.get('/fromIndex', function(req, res, next) {
  res.render('countersign/fromIndex');
})

router.get('/getfromSend', function(req, res, next) {
  var info={
    id:random(8),
    message:'',
    text:'',
    min:0,
    partner:[],
    type:false,
    statue:0//未满足
  };
  if(common.getExistUndone()){
    var tran=global.undone[0];
    info.id=tran.id;
    info.message=tran.info;
    info.text=tran.text;
    info.min=tran.min;
    info.partner=tran.participant;
    info.type=true;
    if(tran.type<2){//未上链
      if(common.checkTransaction(tran.id)==0){
        info.statue=1;//已满足
      } 
    }else{//上链
      if(tran.type==2){//待确认
        info.statue=2;
      }else{//已上链
        info.statue=3;
      }
    }
  }
  res.render('countersign/getfromSend',{info:info,companyA: global.address[1].address, companyB: global.address[2].address,companyC: global.address[3].address});
})

router.get('/sendCountersign', function(req, res, next) {
  var id=req.query.id
    ,txtinfo=req.query.txtinfo
    ,txtmessage=req.query.txtmessage
    ,selectname=req.query.selectname
    ,num=req.query.num;
  var participant=[];
  participant.push(global.address[0].address);
  var selectArray=selectname.split(',');
  selectArray.forEach(function(v, i){
    participant.push(global.address[v].address);
  })
  common.saveUndone(id,txtinfo,txtmessage,participant,num);
  res.render("countersign/success",{id:id});
})

router.get('/getselect', function(req, res, next) {
  res.render('countersign/select');
})

router.get('/selectID', function(req, res, next) {
  var id=req.query.id;
  res.send(common.checkExit(id));
})

router.get('/select', function(req, res, next) {
  var id=req.query.id;
  var trans=common.getUndone(id);
  var list=[];
  trans.participant.forEach(element=>{
    var mes={
      'type':false,
      'address':element
    };
    if(trans.type==3 || common.checkCountersign(element)){
      mes.type=true;
    }
    list.push(mes);
  })
  res.render('countersign/info',{trans:trans,from:global.address[0].address,list:list});
})

router.get('/getCompany', function(req, res, next) {
  var index=req.query.index;
  var type=false;
  if(common.checkCompany(global.address[index].address)){
    type=true;
  }
  res.render('countersign/company',{address:global.address[index].address,type:type});
})

router.get('/message', function(req, res, next) {
  var address=req.query.address;
  var trans=global.undone[0];
  var list=[];
  trans.participant.forEach(element=>{
    var mes={
      'type':false,
      'address':element
    };
    if(common.checkCountersign(element)){
      mes.type=true;
    }
    list.push(mes);
  })
  res.render('countersign/note',{trans:trans,from:global.address[0].address,list:list,address:address});
})

router.get('/messageSuccess', function(req, res, next) {
  common.joinUndone(req.query.address);
  res.render("countersign/sign-success",{id:global.undone[0].id});
})

router.get('/send',async function(req, res, next) {
    var nonce=await rpc.getNonce();
    var undone=global.undone[0];
    var transaction=common.getTransaction(nonce,undone.max,undone.min,undone.pubkeyHashArray,undone.pubkeyArray,undone.prikeyArray);
    var result=await rpc.sendTransaction(transaction.transaction);
    if(result==1){
      common.updateUndone(transaction.txHash);
      res.send(true);//广播成功
    }else{
      res.send(false);//广播失败
    }    
})

module.exports = router;
