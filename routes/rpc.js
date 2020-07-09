const axios = require('axios');
const { UnorderedCollection } = require('http-errors');

class rpc{

  async getNonce(){
    var address=global.address[0];
    var resust=await axios.post(ip+'sendNonce?pubkeyhash='+address.pubkeyHash)
    .then(function (response) {
      if(response.data.code==5000){
        return 0;
      }
      return response.data.data;
    }).catch(function (error) {
      console.log(error);
      return 0;
    });
    return resust;
  }

  async getNoncePubkeyHash(pubkeyHash){
    var resust=await axios.post(ip+'sendNonce?pubkeyhash='+pubkeyHash)
    .then(function (response) {
      if(response.data.code==5000){
        return 0;
      }
      return response.data.data;
    }).catch(function (error) {
      console.log(error);
      return 0;
    });
    return resust;
  }

  async sendTransaction(traninfo){
    var resust=await axios.post(ip+'sendTransaction?traninfo='+traninfo)
      .then(function (response){
          console.log(response.data);
          if(response.data.code==5000){
            return 0;
          }
          return 1;
      }).catch(function (error) {
        console.log(error);
        return 0;
      });
      return resust;
  }

  async getTransaction(tranhash){
    var resust=await axios.get(ip+'transaction/'+tranhash)
      .then(function (response){
          if(response.data.code==400){
            return null;
          }
          return response.data;
      }).catch(function (error) {
        return null;
      });
      return resust;
  }

  async getHeight(){
    var resust=await axios.get(ip+'height')
      .then(function (response){
          if(response.data.code==5000){
            return 0;
          }
          return response.data.data;
      }).catch(function (error) {
        return 0;
      });
      return resust;
  }

}

  



var ip='http://139.129.12.159:19585/';

module.exports = rpc;