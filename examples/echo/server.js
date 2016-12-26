
/**
 * Module dependencies.
 */

var http = require('http')
    // use require('websocket.io') if you installed with NPM
  , wsio = require('../../lib/websocket.io')

/**
 * Create HTTP server.
 */

var server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end([
      '<script>'
    , "var ws = new WebSocket('ws://127.0.0.1:3000');"
    , 'ws.onmessage = function (data) { ws.send(data); };'
    , '</script>'
  ].join(''));
});

/**
 * Attach websocket.io
 */

var ws = wsio.attach(server)
  , i = 0

ws.on('connection', function (client) {
  var id = ++i, last

  console.log('Client %d connected', id);

  function ping () {
    client.send('ping!');
    if (last) console.log('Latency for client %d: %d ', id, Date.now() - last);
    last = Date.now();
  };

  ping();
  client.on('message', function(data){
    var req = JSON.parse(data);
    if (req.type === 'tokenreq'){
      client.send('{"tokenresp":"1234567890ABCDEF"}');
    } else if (req.type === 'tokencheck'){
      if (req.token === '1234567890ABCDEF'){
        client.send('{"checkresp":"valid"}');
      }
      else{
        client.send('{"checkresp":"invalid"}');
      }
    } else if (req.type === 'fileUploaded'){
        console.log('file uploaded %s', req.filename);
    }
    else{
      client.send(data);
    }
  });
});

/**
 * Listen.
 */

server.listen(3000, function () {
  console.error('\033[96m ∞ listening on http://127.0.0.1:3000 \033[39m');
});
