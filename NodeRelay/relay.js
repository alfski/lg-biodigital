// websocket-relay.js
// cesium-lg/server.js & websocket-relay.pl used as a skeleton //Ali 17433668
// 20160825 websocket-relay.pl fully converted to javascript/NodeJS
// 20161001 Jon added record Function
// 20161108 Alf strip back & refactor - correct broken client id, now user client address + port

var DEBUG = 0;

var http = require('http'),
		ProtoBuf = require("protobufjs"),
		ws = require('ws');

// Initialize from .proto file
var builder = ProtoBuf.loadProtoFile( 'message.proto' ),
    Message = builder.build( 'Control' );

( function() {
  'use strict';

  var CONFIG = {
  	NODE_SERVER_IP: 'localhost',
  	NODE_SERVER_PORT: 3000,
	};

  var server = http.createServer();

  server.listen( CONFIG.NODE_SERVER_PORT, function() {
    if (DEBUG) console.log("Relay Server listening on " + CONFIG.NODE_SERVER_IP + ":" + CONFIG.NODE_SERVER_PORT);
  });

  var wsServer = new ws.Server( {
    server: server
  });

	var wsClients = new Array(),
	    noOfClients = 0,
	    lastMessage, masterClientAddrPort = '';

	wsServer.on( 'connection', function( socket ) {

		var clientAddrPort = socket._socket.remoteAddress + ':' + socket._socket.remotePort;

		noOfClients++;
		wsClients[ clientAddrPort ] = socket;

		if (DEBUG) console.log('New client connected from ' + clientAddrPort + ' ('+ noOfClients+' clients)');

		socket.on( 'message', function( messageData, flags ) {

			var type, data, protobufMsg;

			if (flags.binary) {
				try {	// BINARY
					protobufMsg = Message.decode( messageData );
					type = protobufMsg.Type;
					data = protobufMsg.Data;
					if (DEBUG) console.log( 'Message binary. Type:' + type + ' Data:' + data );
      	} catch (err) {
					if (DEBUG) console.log( 'Could not decode binary message' );
      	}
			} else { // not a binary websocket connection
				//var vals = messageData.split(',');
				type = messageData.substring( 0, messageData.indexOf(',') );
				data = messageData.substring( messageData.indexOf(',') + 1, messageData.length );
				if (DEBUG) console.log( 'Message not binary. Type:' + type + ' Data:' + data );

			} // flags.binary

			switch (type) {
				case "MASTER":
					masterClientAddrPort = clientAddrPort;
					if (DEBUG) console.log( 'Client '+ masterClientAddrPort + ' is declaring master status.' );
					break;

				case "RESEND":
					wsClients[ clientAddrPort ].send( lastMessage );
					break;

				default: // do the relay thing
					for (var i in wsClients) {
						if (i != clientAddrPort && i != masterClientAddrPort) { // don't send to self or master
							//console.log( 'sending to i=' + i );
							wsClients[i].send( messageData );
							//wsClients[i].send( protobufMsg.toBuffer() );
						}
					}

					if ( messageData !== "R" ) {
						lastMessage = messageData;
					}
				break;
			}

		});

    socket.on( 'close', function( reasonCode, description ) {
			delete wsClients[ clientAddrPort ];
			noOfClients--;
			console.log('Client ' + clientAddrPort + ' disconnected. Now '+ noOfClients +' clients.');
    });

  });

	server.on( 'error', function( e ) {
    if ( e.code === 'EADDRINUSE' ) {
			console.log('Error: Port ' + CONFIG.NODE_SERVER_PORT + ' is already in use.');
    } else if ( e.code === 'EACCES' ) {
			console.log('Error: No permission to listen on port ' + CONFIG.NODE_SERVER_PORT);
  	}
  	console.log( e );
  	process.exit( 1 );
	});

	server.on( 'close', function() {
		console.log( 'Relay Server stopped.' );
	});

	process.on( 'SIGINT', function() {
		console.log( 'Relay Server stopping.' );
    process.exit( 1 );
	});

})();
