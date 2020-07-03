var express = require('express');
var request=require('request');
const axios = require('axios');
var router = express.Router();

router.get('/', function(req, res, next) {
  var e=request({url:'http://47.56.67.236:19585/block/-1',
    method:'GET',
    headers:{'Content-Type':'text/json' }
    },function(error,response,body){
        if(!error && response.statusCode==200){
            console.log(JSON.parse(body).body)
            res.send(JSON.parse(body).body);
        }
    });
});

router.post('/test', function(req, res, next) {
  console.log(req.body.pubkeyhash);
  axios.post('http://47.56.67.236:19585/sendBalance?pubkeyhash='+req.body.pubkeyhash)
    .then(function (response) {
      console.log(response.data);
      res.send(response.data);
    }).catch(function (error) {
      console.log(error);
      next();
    });
  
});

module.exports = router;