const ws = require('ws');
const client = new ws('ws://localhost:4040');
class mgapp {
constructor (id,token) {
        this.id = id;
        this.token = token;
    }
    connect = async () => {
        return new Promise((resolve, reject) => {
        client.on('open', () => {
            client.send(JSON.stringify({
                client: 'app',
                channel: 'auth',
                action: 'login',
                auth:{
                id: this.id,
                token: this.token
                }
            }));
        });
        client.on('message', (data) => {
        let msg = JSON.parse(data);
        if(msg.channel == 'auth') {
            if(msg.status == 200) {
                this.name = msg.name;
                return resolve("Authed as "+msg.name+"!")
            } else {
                reject("Auth failed!")
            }
        }
        if(msg.channel == 'error') {
            reject(msg.error)
        }
        })
    })
}
    createcall = async (user,perms,redirect) => {
        return new Promise((resolve, reject) => {
            if(!redirect) redirect = 'none';
            client.send(JSON.stringify({
                client: 'app',
                channel: 'tpa',
                action: 'createcall',
                user: user,
                perms: perms,
                redirect: redirect,
                auth:{
                    id: this.id,
                    token: this.token
                    }
            }));
            client.on('message', (data) => {
                let msg = JSON.parse(data);
                if(msg.channel == 'tpa') {
                    if(msg.status == 200) {
                        return resolve(msg.url)
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
        VIEW_GROUPS: 'view_groups',
        VIEW_MESSAGES: 'view_messages',
    }
}
module.exports = mgapp;