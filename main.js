const ws = require('ws');

class mgapp {
constructor (id,token) {
        this.client = new ws('ws://localhost:4040');
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
            if (msg.channel == 'auth') {
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
                if(msg.channel == 'app') {
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
    permTypes = {
        VIEW_PROFILE: 'view_profile',
        VIEW_FRIENDS: 'view_friends',
        VIEW_CHATS: 'view_chats',
        VIEW_POSTS: 'view_posts',
        VIEW_FOLLOWED: 'view_followed',
    }
}
module.exports = mgapp;