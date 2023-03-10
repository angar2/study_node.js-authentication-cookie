module.exports = {
    HTML: function(title, list, body, control,authStatus) {
      return `
        <!doctype html>
        <html>
          <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
            </head>
          <body>
            ${authStatus}
            <h1><a href="/">WEB</a></h1>
            <ol>
              ${list}
            </ol>
            ${control}
            ${body}
          </body>
        </html>
        `
    },
    list: function(filelist) {
      var list = '';
      var i = 0;
      while(i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
      }
      return list;
    }
  };