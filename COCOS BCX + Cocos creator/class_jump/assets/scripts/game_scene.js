
import celerx from "celerx";
import seed from "seed-random";
import bcxAdapter from "bcxAdapter";


var UtilsFB = require("UtilsFB");
var UtilsCommon = require("UtilsCommon");
var SkinMgr = require('SkinMgr');
var ScreenMgr = require('ScreenMgr');
const leaderboardScore = "score_world";


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

var game_scene = cc.Class({
    extends: cc.Component,

    

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        player: {
            type: cc.Node,
            default: null,
        },

        block_prefab: {
            default: [],
            type: cc.Prefab,
        },

        block_root: {
            type: cc.Node,
            default: null,
        },

        left_org: cc.v2(0, 0),

        map_root: {
            type: cc.Node,
            default: null,
        },

        y_radio: 0.5560472,

        checkout: {
            type: cc.Node,
            default: null,
        },

        scoreFXMgr: {
            default: null,
            type: require('ScoreFXMgr'),
        },

        scoreOvertakeMgr: {
            default: null,
            type: require('ScoreOvertakeMgr'),
        },

        scoreLabel: {
            default: null,
            type: cc.Label,
        },

        hintControlLabel: {
            default: null,
            type: cc.Label,
        },

        btnShare: {
            default: null,
            type: cc.Node,
        },

        screenLeaderboard: {
            default: null,
            type: require('ScreenLeaderboard'),
        },

        playerSkinSprite: {
            default: null,
            type: cc.Sprite,
        },
        score: {
            default: 0,
            type:cc.Node,
        }
    },

    statics: {
        instance: null,
    },

    
    // LIFE-CYCLE CALLBACKS:

    onLoad () {


        game_scene.instance = this;
        this.mapMoving = false;
        this.isGameOver = true;
        this.gaming = false;

        this.mapRootInitPos = this.map_root.getPosition();
        this.score = 0;
        this.player_com = this.player.getComponent("player");

        this.playerArray = null;

        this.currentSkinIndex = 0;

        if(bcxAdapter){
            bcxAdapter.initSDK(function(res){
                console.log("initSDK",res)
              if(res){
                bcxAdapter.login(function(res){
                    console.log("login",res)
                    self.accountDisplay.string = res.account_name;
                    self.account_name = res.account_name;
                    bcxAdapter.getBalanceByAccount(res.account_name,function(res){
                        console.log("getBalanceByAccount",res)
                        self.balanceDisplay.string = res.data.COCOS;
                    }) 
                })
              }
            })
        }
    },

    start () {
        UtilsFB.init(leaderboardScore);
    },

    onGameStart: function(showLabelScore, holdScore) {
        //var match = celerx.getMatch();
        //seed(match && match.sharedRandomSeed, { global: true });
        //celerx.start();



        this.map_root.setPosition(this.mapRootInitPos);
        this.block_root.removeAllChildren(true);
        if (!holdScore) {
            this.score = 0;
        }
        this.updateScoreDisplay();
        this.checkout.active = false;
        this.player_com.direction = 1;

        this.cur_block = cc.instantiate(this.block_prefab[Math.floor(Math.random() * 3)]);
        this.block_root.addChild(this.cur_block);
        this.cur_block.setPosition(this.block_root.convertToNodeSpaceAR(this.left_org));

        var w_pos = this.cur_block.getChildByName("mid").convertToWorldSpaceAR(cc.v2(0, 0));
        this.player.setPosition(this.map_root.convertToNodeSpaceAR(w_pos));
        this.next_block = this.cur_block;
        this.block_zorder = -1;
        this.add_block();

        this.showLabelScore(showLabelScore);

        // UtilsFB.invitePlayerRandomAsync(UtilsCommon.getScreenshotBase64(UtilsCommon.getCameraMain())).catch(error => {});
        this.isGameOver = false;
    },

    showLabelScore: function(active) {
        this.scoreLabel.node.active = active;
        this.hintControlLabel.node.active = active;
        this.btnShare.active = active;
    },

    add_block() {
        this.cur_block = this.next_block;

        this.next_block = cc.instantiate(this.block_prefab[Math.floor(Math.random() * 3)]);
        this.block_root.addChild(this.next_block);
        // this.next_block.setLocalZOrder(this.block_zorder);
        this.next_block.zIndex = this.block_zorder;
        this.block_zorder --;

        var x_distance = 200 + Math.random() * 200;
        var y_distance = x_distance * this.y_radio;

        var next_pos = this.cur_block.getPosition();
        next_pos.x += (x_distance * this.player_com.direction);
        next_pos.y += y_distance;
        this.next_block.setPosition(next_pos);


        this.player_com.set_next_block(this.next_block.getComponent("block"));

        for (let i = this.block_root.childrenCount - 1; i >= 0; i--) {
            this.destroyOutBlock(this.block_root.children[i])
        }
        // end 
    },

    destroyOutBlock: function(blockNode){
        let block = blockNode.getComponent('block');
        let blockPosWorld = blockNode.parent.convertToWorldSpaceAR(blockNode.getPosition());
        let gamePosWorld = this.node.getPosition();
        let distance = blockPosWorld.sub(gamePosWorld);
        let minDistanceX = this.node.width / 2 + blockNode.width / 2;
        let minDistanceY = this.node.height / 2 + blockNode.height / 2;

        if (Math.abs(distance.x) > minDistanceX && Math.abs(distance.y) > minDistanceY) {
            blockNode.destroy();
        }
    },

    move_map(offset_x, offset_y) {
        this.mapMoving = true;
        var m1 = cc.moveBy(0.5, offset_x, offset_y);
        var end_func = cc.callFunc(function() {
            this.mapMoving = false;
            this.add_block();
        }.bind(this));

        var seq = cc.sequence([m1, end_func]);
        this.map_root.runAction(seq);
    },

    on_checkout_game: function() {
        

        var x=makeid(10);

        this.isGameOver = true;
        this.showLabelScore(false);
        console.log(x,this.score,"=================================");
        bcxAdapter.sendWinCocos(x,this.score, function(res){
            console.log("sendmincocos",res)
        })
        ScreenMgr.instance.showScreen('ScreenGameOver');

        return;
    },

    gainScore: function(posWorld, score) {
        this.score += score;
        this.updateScoreDisplay();
        this.scoreFXMgr.playScoreFX(posWorld, score);

        let playerOvertaken = UtilsFB.getPlayerInfoScoreOvertake(leaderboardScore, this.score - score, this.score);
        if (playerOvertaken.length > 0) {
            this.scoreOvertakeMgr.play(posWorld, playerOvertaken);
        }
    },

    updateScoreDisplay: function() {
        this.scoreLabel.string = "Score: " + this.score;
    },

    onShowLeaderboard: function() {
        this.screenLeaderboard.showLeaderboard(leaderboardScore);
    },

    onShare: function() {
        var imageBase64 = UtilsCommon.getScreenshotBase64(UtilsCommon.getCameraMain());
        UtilsFB.chooseAsync(imageBase64).catch(error =>{});
    },

    onSkinChange: function(skinIndex) {
        if (this.currentSkinIndex != skinIndex) {
            this.currentSkinIndex = skinIndex;
            this.playerSkinSprite.spriteFrame = SkinMgr.instance.getSkinSpriteFrame(skinIndex);
        }
    },
});
