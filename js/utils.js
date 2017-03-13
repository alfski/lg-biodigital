function printConfig() {
  var output = '';
  for (var i in CONFIG) {
    output += i + ': ' + CONFIG[i]+'\n';
  }

  return output;
}

function getQueryStringVars() {
    var server_variables = {};
    var query_string = window.location.search.split( "?" )[ 1 ];
    if (!query_string ) return false;
    var get = query_string.split( "&" );
        
    for ( var i=0; i < get.length; i++ ) {
        var pair = get[ i ].split( "=" );
        server_variables[ pair[ 0 ] ] = unescape( pair[ 1 ] );
    }

    return server_variables;
}

var webSocket, socketOpen = false;
var queryString = getQueryStringVars();

// overwrite some global CONFIG params with queryString params
if (queryString['ws'])  { CONFIG.ws  = queryString['ws']; }
if (queryString['yaw']) { CONFIG.yaw = queryString['yaw']; }
if (queryString['fov']) { CONFIG.fov = queryString['fov']; }
if (queryString['background']) { CONFIG.background = queryString['background']; }
if (queryString['zoom']) { CONFIG.zoom = queryString['zoom']; }
if (queryString['startY']) { CONFIG.startY = queryString['startY']; }

function connectToRelay() {
  webSocket = new ReconnectingWebSocket( CONFIG.ws );

  webSocket.onopen = function() {
    socketOpen = true;
    if (document.getElementById('RelayStatus')) {
      document.getElementById('RelayStatus').style.backgroundColor = '#80ff80';
      document.getElementById('RelayStatus').value = 'Relay OK';
    }
  }

  webSocket.onclose = function() {
    socketOpen = false;
    if (document.getElementById('RelayStatus')) {
      document.getElementById('RelayStatus').style.backgroundColor = '#ff8080';
      document.getElementById('RelayStatus').value = 'Relay Not OK';
    }
  }

  webSocket.onmessage = function( evt ) {
    handleMesg( evt.data );
  }

}

function socketSend( str ) {
  if (socketOpen) {
    //console.log("send:"+str);
    webSocket.send( str );
  } else {
    console.log("no websocket");
  }
}

var httpClient = function() {
    this.get = function(aUrl, aCallback) {
        var aHttpRequest = new XMLHttpRequest();
        aHttpRequest.onreadystatechange = function() { 
            if (aHttpRequest.readyState == 4 && aHttpRequest.status == 200)
                aCallback(aHttpRequest.responseText);
        }

        aHttpRequest.open( "GET", aUrl, true );            
        aHttpRequest.send( null );
    }
}

function getJSON(url, callback){
  var xmlhttp;
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
      callback(xmlhttp.responseText);
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function deg2Rad(angle) { return (angle/180) * Math.PI; }
