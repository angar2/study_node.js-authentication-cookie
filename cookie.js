const http = require('http');
http.createServer((req, res) => {
    res.writeHead(200, {
        'Set-cookie': ['yummy_cookie=choco', 'tasty_cookie=strawbarry']
    });
    res.end('Cookie!');
}).listen(3000);