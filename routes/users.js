var express = require('express');
var router = express.Router();
const KeyStore = require('keystore_wdc');
const Common=require('./countersign/Common');
var common=new Common();

const asyncHandler = function (fn) {
	return function (...args) {
		Promise.resolve(fn(...args)).catch(args[2]);
	}
}

/* GET users listing. */
// router.get('/',asyncHandler(async (req, res, next)=> {
//   var ks= new KeyStore();
//   global.keystore.forEach(async element => {
//     console.log("----->"+JSON.stringify(element));
//     const prikey=await ks.DecryptSecretKeyfull(element,"12345678");
//     //   .then((data)=> {
//     //     console.log('222222222222222>'+data);
//     //     prikey=data;
//     // })
//     console.log("++++++++++>"+prikey);
//   });
//   res.send('respond with a resource');
// }));

// router.get('/s', function(req, res, next) {
//   var ks= new KeyStore();
//   global.keystore.forEach(async element => {
//     console.log("----->"+JSON.stringify(element));
//     console.log("++++++++++>"+await common.getprikey(element,"12345678"));
//   });
//   res.send('respond with a resource');
// });

router.get('/a', function(req, res, next) {
  // console.log(global.address[1]);
  console.log(common.getkeystore(global.keystore,1));
  res.send('respond with a resource');
});

module.exports = router;
