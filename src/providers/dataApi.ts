import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Api } from "./api";
import { Config } from "./config";
import { Local } from "./local";
import { Constants } from "./constants";
import { UserInterface ,NewReplyInterface} from "../interfaces/index";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataApi {
  private config:Config;
  constructor(private http: Http,
              private api:Api,
              private local:Local) {
                //获取单例config
                this.config = Config.getInstance();
              }

  getTopics(page=0,limit=this.config.pageLimit,tab='all',mdrender=true): any{
      return this.api.get('/topics',{page,limit,tab,mdrender})
  }

  getTopic(id):any{
    console.log('/topic/'+id);
    if(!this.config.token){
       return this.api.get('/topic/'+id)
    }else{
       return this.api.get('/topic/'+id,{accesstoken:this.config.token})
    }
   
  }

  newTopic(obj):Promise<any>{
      return new Promise((resolve,reject)=>{
        if(!this.config.token){
          resolve({type:false,data:{message:'未登录'}});
      }else{
        obj.accesstoken = this.config.token;
        console.log(obj);
        this.api.post('/topics',obj).then((res)=>{
           resolve({type:true,data:res});
        }).catch((err)=>{
           resolve({type:false,data:err});
        })
      }
    })
  }

  updateTopic(obj):any{
      return this.api.post('/topics/update',obj);
  }

  newReply(topicId:string, obj:NewReplyInterface):Promise<any>{
    return new Promise((resolve,reject)=>{
        if(!this.config.token){
          resolve({type:false,data:{message:'未登录'}});
        }else{
          obj.accesstoken = this.config.token;
          this.api.post('/topic/'+topicId+'/replies',obj).then((res)=>{
             resolve({type:true,data:res});
          }).catch((err)=>{
             resolve({type:false,data:err});
          })
        }
    })
  }

  makeUp(replyId:string):Promise<any>{
    return new Promise((resolve,reject)=>{
        let obj:any={};
        obj.accesstoken = this.config.token;
        this.api.post('/reply/'+replyId+'/ups',obj).then((res)=>{
            resolve({type:true,data:res});
        }).catch((err)=>{
            resolve({type:false,data:err});
        })
    })
  }
  
  collect(topicId){
    let obj:any = {};
    obj.accesstoken = this.config.token;
    obj.topic_id=topicId;
    return this.api.post('/topic_collect/collect',obj);
  }

  deCollect(topicId){
    let obj:any = {};
    obj.accesstoken = this.config.token;
    obj.topic_id=topicId;
    return this.api.post('/topic_collect/de_collect',obj);
  }


  
  getUser(loginname:string):any{
    return this.api.get('/user/'+loginname);
  }

  getUserCollects(loginname):any{
    return this.api.get('/topic_collect/'+loginname);
  }

  getDrafts():any{
    // return this.api.readFromLocalJson(this.config.DRAFTS_URL);
    return this.local.get(Constants.DRAFTS);

  }

  setDrafts(body):any{
    // return this.api.writeToLocalJson(this.config.DRAFTS_URL,body);
    return this.local.set(Constants.DRAFTS, body);
  }

  verifyToken(accesstoken:string):Promise<any>{
    // return this.api.post('/accesstoken',{accesstoken});
    return new Promise((resolve,reject)=>{
      this.http.post(this.config.hostURL+'/accesstoken', {accesstoken} )
      .toPromise()
      .then(res => res.json())
      .then((res)=>{
        resolve({type:true,data:res});
      })
      .catch((err)=>{
        resolve({type:false,data:err.json()})
      });
    })
  }

  setToken(token:string){
    this.local.set(Constants.ACCESSTOKEN, {data:token});
    this.config.token=token;
  }
  getToken(){
    return this.config.token;
  }

  setLoginUserWithId(user:any){
    this.local.set(Constants.LOGINUSERWITHID, {data:user});
    this.config.loginUserWithId=user;
  }
  getLoginUserWithId(){
      return this.config.loginUserWithId;
  }

  setLoginUser(user){
    this.local.set(Constants.LOGINUSER, {data:user});
    this.config.loginUser=user;
  }
  getLoginUser():UserInterface{
    return this.config.loginUser;
  }

  logout(){
    this.local.remove(Constants.ACCESSTOKEN);
    this.local.remove(Constants.LOGINUSER);
    this.local.remove(Constants.LOGINUSERWITHID);
    this.config.token='';
    this.config.loginUser=null; 
    this.config.loginUserWithId=null;
    console.log('token、loginuser已经清除，退出成功');
  }

 

}

