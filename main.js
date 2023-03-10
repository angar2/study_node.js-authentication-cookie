var http = require('http');
var fs = require('fs'); // file system
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHTML = require('sanitize-html');
var template = require('./lib/template.js');
var cookie = require('cookie');

function authIsOwner(request, response) {
  var cookies = {};
  var isOwner = false;
  if(request.headers.cookie) {
    cookies = cookie.parse(request.headers.cookie);
  };
  if(cookies.email === 'email@email.com') {
    if(cookies.password === '1234') {
      isOwner = true;
    }
  }
  return isOwner;
}

function authStatus(request, response) {
  var authStatus = '<p><a href="/login">Login</a></p>';
  var isOwner = authIsOwner(request, response);
  if(isOwner){
    authStatus = '<p><a href="/logout_process">Logout</a></p>';
  };
  return authStatus;
};

function authentication(request, response) {
  if(authIsOwner(request, response) === false) {
    response.end('login required')
    return false
  }
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/') {
      if(queryData.id === undefined) {
        fs.readdir(`./data`, function(err, filelist) {
          var title = 'Welcome';
          var desc = 'Hello Node';
          var list = template.list(filelist);
          var HTML = template.HTML(title, list, `<h2>${title}</h2><p>${desc}</p>`, `<a href="/create">Create</a>`,authStatus(request, response));
          response.writeHead(200);
          response.end(HTML);
        });
      } else {
        fs.readdir(`./data`, function(err, filelist) {
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, desc){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHTML(title);
            var sanitizedDesc = sanitizeHTML(desc);
            var list = template.list(filelist);
            var HTML = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2><p>${sanitizedDesc}</p>`,
              `<a href="/create">Create</a>
                <a href="/update?id=${sanitizedTitle}">Update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}" />
                  <input type="submit" value="Delete" />
                </form>`,
                authStatus(request, response)
            );
            response.writeHead(200);
            response.end(HTML);
          })
        });
      }
    } else if(pathname === '/create') {
      authentication(request,response)
      fs.readdir(`./data`, function(err, filelist) {
        var title = 'Create';
        var list = template.list(filelist);
        var HTML = template.HTML(title, list,
          `<form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title" /></p>
            <p><textarea type=text name="description" placeholder="description"></textarea></p>
            <p><input type="submit" /></p>
          </form>`,
          `<h2>${title}</h2>`,
          authStatus(request, response)
        );
        response.writeHead(200);
        response.end(HTML);
      });
    } else if(pathname === '/create_process') {
      authentication(request,response)
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {location: `/?id=${title}`});
          response.end("Success");
        });
      });
    } else if(pathname === '/update') {
      authentication(request,response)
      fs.readdir(`./data`, function(err, filelist) {
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, desc){
          var title = queryData.id;
          var list = template.list(filelist);
          var HTML = template.HTML(title, list,
            `<form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}" />
              <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
              <p><textarea type=text name="description" placeholder="description">${desc}</textarea></p>
              <p><input type="submit" /></p>
            </form>`, 
            `<a href="/create">Create</a> <a href="/update?id=${title}">Update</a>`,
            authStatus(request, response)
          );
          response.writeHead(200);
          response.end(HTML);
        })
      });
    } else if(pathname === '/update_process') {
      authentication(request,response)
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(err) {
          fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.writeHead(302, {location: `/?id=${title}`});
            response.end("Success");
          });
        });
      });
    } else if(pathname === '/delete_process') {
      authentication(request,response)
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        fs.unlink(`data/${id}`, function(err) {
          response.writeHead(302, {location: `/`});
          response.end("Success");
        });
      });
    } else if(pathname === '/login') {
      fs.readdir(`./data`, function(err, filelist) {
        var title = 'Login';
        var list = template.list(filelist);
        var HTML = template.HTML(title, list, 
          `<h2>${title}</h2>
          <form action="login_process" method="post">
            <p><input type="text" name="email" placeholder="Email"></p>
            <p><input type="password" name="password" placeholder="Password"></p>
            <p><input type="submit" value="Login"></p>
          </form>`, 
          `<a href="/create">Create</a>`
        );
        response.writeHead(200);
        response.end(HTML);
      });
    } else if(pathname === '/login_process') {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var email = post.email;
        var password = post.password;
        if(email === 'email@email.com'){
          if(password === '1234') {
            response.writeHead(302, {
              'Set-cookie': [
                `email=${email}`, 
                `password=${password}`
              ], 
              location: `/`
            });
            response.end("Success");
          };
        };
        response.end("Who?");
      });
    } else if(pathname === '/logout_process') {
        var body = '';
        request.on('data', function(data) {
          body = body + data;
        });
        request.on('end', function() {
          var post = qs.parse(body);
              response.writeHead(302, {
                'Set-cookie': [
                  `email=; max-age=0`, 
                  `password=; max-age=0`
                ], 
                location: `/`
              });
              response.end("Success");
        });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);