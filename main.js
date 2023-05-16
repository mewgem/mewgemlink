const ws = require('ws');
const client = new ws('ws://localhost:4040');

class app {
    constructor (name,token) {
        this.name = name;
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
                name: this.name,
                token: this.token
                }
            }));
        });
        client.on('message', (data) => {
        let msg = JSON.parse(data);
        if(msg.channel == 'auth') {
            if(msg.status == 200) {
                return resolve("Authed as "+this.name+"!")
            } else {
                reject("Auth failed!")
            }
        }
        })
    })
}
}

module.exports = app;