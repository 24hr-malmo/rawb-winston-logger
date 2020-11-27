const fetch = require('node-fetch');

const s1 = require('./server1');
const s2 = require('./server2');
const s3 = require('./server3');
const s4 = require('./server-restify4');
const s5 = require('./server-restify-rawb5');


const run = async () => {

    await s1.init();
    await s2.init();
    await s3.init();
    await s4.init();
    await s5.init();

    let response1 = await fetch('http://localhost:3001/foo');
    let result1 = await response1.text();

    // console.log(result1);

};

run();
