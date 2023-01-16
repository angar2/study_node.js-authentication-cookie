const http = require('http');
const cookie = require('cookie');
http.createServer((req, res) => {
    res.writeHead(200, {
        'Set-cookie': [
            'yummy_cookie=choco', 
            'tasty_cookie=strawbarry',
            `permanent=cookie; Max-age=${60*60*24*365}`]
    });
    var cookies = {};
    if(req.headers.cookie !== undefined){
        cookies = cookie.parse(req.headers.cookie);
    };
    console.log(cookies);
    res.end('Cookie!');
}).listen(3000);