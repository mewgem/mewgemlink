# mewgemlink
MewGem Link module for bots
## Start Up Code Sample
```js
const mewgemlink = require('../main.js');
const app = new mewgemlink('test','testtkn');

main();
async function main() {
await app.connect().then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
})
}
```
output: `Authed as {APPNAME}!`