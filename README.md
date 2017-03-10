# lg-biodigital

BioDigital on Liquid Galaxy (take 1)

## Start the websocket relayer

In NodeRelay is a NodeJS based websocket relayer  called relay.js.

Run this on lg-head on a place accessible to the nodes.

You may need to change the port the relay listens on and fiddle with lg-head firewall.

```
cd NodeRelay
node ./relay.js &
```

Some node modules will need to be installed, an ```npm install``` should catch most of them. But there wil be a couple which may be a follow-your-nose install.

config.js contains the URI that the application client.html and control.html will attempt to connect too.


## Client setupp

Using the LG CMS for each screen (L3, L2, L1, C, R1, R2, R3) create a full screen browser session with this URL...

```
http://host/path/client.html?yaw=DEGREES
```

You can override the ws relay address by adding the parameter

``` 
/client.html?yaw=67&ws=ws://192.168.0.2:3000/relay
```

## Control setup

```
http://host/path/control.html
```


-- 
Andrew (Alf) Leahy
