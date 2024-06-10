const ws = require('ws');

class mgapp {
constructor (id,token) {
        this.client = new ws('wss://api.mewgem.net');
        this.id = id;
        this.token = token;
        this.messageHandlers = [];
        this.client.on('message', (data) => {
            let msg = JSON.parse(data);
            this.handleMessage(msg);
            });
    }
    connect = async () => {
        return new Promise((resolve, reject) => {    
          this.client.on('open', () => {
            this.client.send(
              JSON.stringify({
                client: 'app',
                channel: 'auth',
                action: 'login',
                auth: {
                  id: this.id,
                  token: this.token,
                },
              })
            );
          });
    
          this.client.on('message', (data) => {
            let msg = JSON.parse(data);
            if (msg.channel == 'auth' & msg.event == 'connection') {
                if (msg.status == 200) {
            return resolve("Logged in as " + msg.name);
            } else {
                return reject(msg.error);
            }
            }
          });    
        });
      }

      handleMessage = (msg) => {
        for (const entry of this.messageHandlers) {
          const { event, handler } = entry;
          if (event === msg.event) {
            handler(msg);
          }
        }
      }
      
    
    on = (event, handler) => {
        const existingHandler = this.messageHandlers.find(entry => entry.event === event);
        if (existingHandler) {
          existingHandler.handler = handler;
        } else {
          this.messageHandlers.push({ event, handler });
        }
      }
      
      
      
    
    createcall = async (perms,once,redirect) => {
        return new Promise((resolve, reject) => {
            if(!redirect) redirect = 'none';
            if(!once) once = false;
            // check to see if perms is an array
            if(!Array.isArray(perms)) {
                return reject("perms must be an array!")
            }
            this.client.send(JSON.stringify({
                client: 'app',
                channel: 'app',
                action: 'createcall',
                once: once,
                perms: perms,
                redirect: redirect,
                auth:{
                    id: this.id,
                    token: this.token
                    }
            }));
            this.client.on('message', (data) => {
                let msg = JSON.parse(data);
                if(msg.channel == 'app' && msg.event == 'callcreation') {
                    if(msg.status == 200) {
                        return resolve({url:msg.url,callid:msg.callid})
                    } else {
                        reject(msg.error)
                    }
                }
                if(msg.channel == 'error') {
                    reject(msg.error)
                }
            })
        })
    }
    usecall = async (callid,action) => {
      return new Promise((resolve, reject) => {
        if(!callid) return reject("callid is required!")
        if(!action) return reject("action is required!")
        this.client.send(JSON.stringify({
          client: 'app',
          channel: 'app',
          action: 'usecall',
          use: action,
          callid: callid,
          auth:{
              id: this.id,
              token: this.token
              }
      }));
      this.client.on('message', (data) => {
        var msg = JSON.parse(data);
        if(msg.channel == 'app' && msg.event == 'callback') {
            if(msg.status == 200) {
                return resolve({data:msg.data,callid:msg.callid,type:msg.type})
            } else {
                reject(msg.error)
            }
        }
        if(msg.channel == 'error') {
            reject(msg.error)
        }
      })
      })
    }
    permTypes = {
        VIEW_PROFILE: 'view_profile',
        VIEW_FRIENDS: 'view_friends',
        VIEW_FOLLOWING: 'view_following',
        VIEW_PLAYMG: 'view_playmg'
    }
    actions = {
        GET_PROFILE: 'get_profile',
        GET_FOLLOWERS: 'get_following',
        GET_FRIENDS: 'get_friends',
        GET_PLAYMG: 'get_playmg'
    }
}
module.exports = mgapp;