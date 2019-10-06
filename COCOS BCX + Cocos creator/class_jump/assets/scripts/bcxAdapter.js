


// import BCX from 'bcx.min.js' 
require('./core.min')

require('./plugins.min')

//cocos配置
var _configParams = {
    ws_node_list: [{
        url: "ws://39.106.126.54:8049",
        name: "COCOS3.0节点2"
    }],
    networks: [{
        core_asset: "COCOS",
        chain_id: '7d89b84f22af0b150780a2b121aa6c715b19261c8b7fe0fda3a564574ed7d3e9'
    }],
    faucetUrl: 'http://47.93.62.96:8041',
    auto_reconnect: true,
    worker: false,
    real_sub: true,
    check_cached_nodes_data: true,
};



let BCXAdpater = cc.Class({
    // onLoad () {},

    start () {
        //console.info("window=1=",window.BcxWeb);
    },

    initSDK (callback) {
          this.contractName = "contract.rajat";         //合约名称
          let timer = null
          clearInterval(timer)
          timer = setInterval(() => {
              if (window.BcxWeb) {
                  this.bcl = window.BcxWeb
                  this.bcl.getAccountInfo().then(res => {
                      if (res.locked) {
                          Message({
                              duration: 1200,
                              message: 'Account Locked',
                              type: 'error',
                          })
                          return
                      }
                      callback(true);
                  })
                  clearInterval(timer)
              }
          }, 1000)
    },


    checkWindowBcx(callback){
        //目前进来的时候可能还没有吧bcx挂在window 需要个定时器
        let check_count = 0
        let self = this
        let sdk_intervral = setInterval(function(){
            console.log("checkWindowBcx",window.BcxWeb)
            if (window.BcxWeb){
                self.bcl = window.BcxWeb
                if(callback){
                    callback(true)
                }
                clearInterval(sdk_intervral);
            }
           
            if(check_count>=3){
                clearInterval(sdk_intervral);
                if(callback){
                    callback(false)
                }
            }
            check_count = check_count + 1

        }, 1000);
    },

    login(callback){
        if(this.bcl){
            try{
                console.log("login===adada=")
                this.bcl.getAccountInfo().then(res => {
                    console.log("res.account_name=="+res.account_name)
                    this.bcl.account_name = res.account_name           
                    if (callback) {
                        callback(res);
                    }
                })
            }catch(e){
                console.log("login==e===="+e)
                console.log("his.bcl.account_name==="+this.bcl.account_name)
                if(this.bcl.account_name){
                    if (callback) {
                        callback(this.bcl.account_name);
                    }
                }
            }
            
        }
    },

    getBalanceByAccount (account, callback) {
        this.bcl.queryAccountBalances({
            assetId:'COCOS',
            account: account,
        
        }).then(function(res){
            console.info('getBalanceByAccount==',res);

            if (res.code === -25 || res.code === 125) {
                //表示还没有这种代币，先给与赋值为0
                res.code = 1;
                res.data.COCOS = 0;
                if (callback) {
                    callback(res);
                }
            }

            if (res.code === 1) {
                if (callback) {
                    callback(res);
                }
            } else if (callback) {
                callback(res);
            }   
        });
    },

    sendWinCocos(account,stars,callback) {

   
        this.bcl.callContractFunction({
            nameOrId: "contract.rajat",
            functionName: 'sendstar',
            valueList:[account, stars],////
            runtime: 10,
            onlyGetFee: false
        }).then(function(res){
            console.info("draw res=",res);

            if (res.code === 1) {
                callback(res);
            } else {
                callback(res);
            }
        }).catch(function(e){
            console.info("draw lottery error=",JSON.stringify(e));
        });
    },

});

let bcxAdapter = new BCXAdpater();

bcxAdapter.start();
module.exports = bcxAdapter;