var http = require('http');
var fs = require('fs'); // file system
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHTML = require('sanitize-html');
var template = require('./lib/template.js');

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
          var HTML = template.HTML(title, list, `<h2>${title}</h2><p>${desc}</p>`, `<a href="/create">Create</a>`);
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
                </form>`
            );
            response.writeHead(200);
            response.end(HTML);
          })
        });
      }
    } else if(pathname === '/create') {
      fs.readdir(`./data`, function(err, filelist) {
        var title = 'Create';
        var list = template.list(filelist);
        var HTML = template.HTML(title, list,
          `<form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title" /></p>
            <p><textarea type=text name="description" placeholder="description"></textarea></p>
            <p><input type="submit" /></p>
          </form>`,
          `<h2>${title}</h2>`
        );
        response.writeHead(200);
        response.end(HTML);
      });
    } else if(pathname === '/create_process') {
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
            `<a href="/create">Create</a> <a href="/update?id=${title}">Update</a>`
          );
          response.writeHead(200);
          response.end(HTML);
        })
      });
    } else if(pathname === '/update_process') {
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
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);