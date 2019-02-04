/**
 *
 * becker adapter
 *
 *
 *  file io-package.json comments:
 *
 *  {
 *      "common": {
 *          "name":         "becker",                  // name has to be set and has to be equal to adapters folder name and main file name excluding extension
 *          "version":      "0.0.0",                    // use "Semantic Versioning"! see http://semver.org/
 *          "title":        "Node.js becker Adapter",  // Adapter title shown in User Interfaces
 *          "authors":  [                               // Array of authord
 *              "name <mail@becker.com>"
 *          ]
 *          "desc":         "becker adapter",          // Adapter description shown in User Interfaces. Can be a language object {de:"...",ru:"..."} or a string
 *          "platform":     "Javascript/Node.js",       // possible values "javascript", "javascript/Node.js" - more coming
 *          "mode":         "daemon",                   // possible values "daemon", "schedule", "subscribe"
 *          "materialize":  true,                       // support of admin3
 *          "schedule":     "0 0 * * *"                 // cron-style schedule. Only needed if mode=schedule
 *          "loglevel":     "info"                      // Adapters Log Level
 *      },
 *      "native": {                                     // the native object is available via adapter.config in your adapters code - use it for configuration
 *          "test1": true,
 *          "test2": 42,
 *          "mySelect": "auto"
 *      }
 *  }
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

var http		= require('http');
var request		= require('request');
var fs = require('fs');
var cron = require('cron');


//you have to require the utils module and call adapter function
const utils =    require(__dirname + '/lib/utils'); // Get common adapter utils

//you have to call the adapter function and pass a options object
//name has to be set and has to be equal to adapters folder name and main file name excluding extension
//adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.becker.0
var adapter = new utils.Adapter('becker');
var devicemap = {};
var schedules = [];
var data_dir;
var schedules_file;

var max_durations = {};

var deviceId = 1;
var id_count = 0;

function getBoolean(val) {	
	if (typeof val === 'boolean' ) {
		return val;
	}
	else if (typeof val === 'string') {
		return ( val == 'true' || val == 'True' );
	}
	else {
		return Boolean(val);
	}
}

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        var tmp = id.split('.');
        var dp = tmp.pop(); //should always be "state"
        var idx = tmp.pop(); // name of the device
        var deviceId = idx.replace(/device_/,'')*1;
        var val = state.val;
        //adapter.log.info(`stateChange: ${deviceId}: ${dp}: ${val}`);
        if ( dp == 'temp' ) { // set temperature, implies setting mode -> individual
            postResponse('deviced.hvac_zone_set_temperature',deviceId,{ hvac_id: deviceId, mode: 'individual', temp: val });
        }
        else if ( dp == 'mode' ) { // set mode
            adapter.log.debug("Device " + deviceId + ": Set MODE to " + val);
            postResponse('deviced.hvac_zone_set_mode',deviceId,{ hvac_id: deviceId, mode: val });
        }
        else if ( dp.indexOf('temp-') > -1 ) { // change mode temperature
            var mode = dp.replace(/temp-/,'');
            postResponse('deviced.hvac_zone_set_temperature',deviceId,{ hvac_id: deviceId, mode: mode, temp: val });
        }
        else if ( dp == 'window-tempdrop' ) { // set windows temperature drop
            postResponse('deviced.item_set_config',deviceId,{ item_id: deviceId, config: {'window-tempdrop': val } });
        }
        else if ( dp == 'window-interval' ) { // set window interval
            postResponse('deviced.item_set_config',deviceId,{ item_id: deviceId, config: {'window-interval': val } });
        }
        else if ( dp == 'auto-schedule' ) { // toggle schedule enabled/disabled
        	adapter.getState('device_'+deviceId+'.schedule', function (e,s) {
        		postResponse('deviced.hvac_zone_set_schedule',deviceId,{ hvac_id: deviceId, enabled: getBoolean(val) } );
        	});
        } 
        else if ( ['up','down','stop','preset1','preset2'].indexOf(dp)>-1 ) { // execute command
            move_shutter(deviceId,dp);
            adapter.setState('device_'+deviceId+'.command',dp,1);
        }
        else if ( dp == 'command' ) { // execute command
            if ( val in commands ) {
                var dev = 'device_'+deviceId;
                move_shutter(deviceId,val);
                adapter.setState(`${dev}.${dp}`,val, true, 1);
                var pos;
                if ( val == "up") { pos = 0; }
                else if ( val == "down" ) { pos = 100; }
                else if ( val == "preset1" ) { pos = 90; }
                else if ( val == "preset2" ) { pos = 70; }
                adapter.setState(`${dev}.position`,pos,1);
            }
        }
        else if ( dp == 'getstate' ) { // execute command
            adapter.log.debug('get_state_from_log');
            postResponse('deviced.deviced_log_get', deviceId, {}, evaluateLog);
        }
        else if ( dp == 'position' ) { // position change
            var dev = 'device_'+deviceId;
            if ( state.val > 100) adapter.setState(`${dev}.position`,100, true);
            else if ( state.val <0 ) adapter.setState(`${dev}.position`,0, true);
        }
        else if ( idx == "Anwesenheit" && dp == 'state'  ) { // presence state changed
            adapter.log.warn("Presence state changed to " + state.val );
            change_presence_states(state.val);
        }
        else {
            adapter.log.error(`stateChange for '${dp}' not yet implemented.`);
        }
    }
});

function move_shutter(deviceId,cmd) {
    //adapter.log.info(`SIMULATE: move shutter ${deviceId} to pos ${cmd}`);
    //return;
    postResponse('deviced.group_send_command', deviceId, {
        group_id: deviceId,
        command: commands[cmd]['cmd'],
        value: commands[cmd]['value']
    });
}

function move_seconds(deviceId,cmd,seconds) {
    adapter.log.info(`moveSeconds: ${deviceId}, ${cmd}, ${seconds}`);
    move_shutter(deviceId,cmd);
    setTimeout(move_shutter,seconds*1000,deviceId,'stop');
}

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj === 'object' && obj.message) {
        if (obj.command === 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    main();
});


var commands = {
    up: { cmd: 'move', value: -1 },
    down: { cmd: 'move', value: +1 },
    stop: { cmd: 'move', value: 0 },
    preset1: { cmd: 'movepreset', value: 1 },
    preset2: { cmd: 'movepreset', value: 2 }
};

var roles = {
    "temp": { name: "Current Temp",role: "value.temperature" },
    "mode": { name: "Temperature Mode",role: "value" },
    "temp-comfort": { name: "Comfort Temp",role: "value.temperature" },
    "temp-eco": { name: "Eco Temp",role: "value.temperature" },
    "window-tempdrop": { name: "Window open temp drop",role: "value.temperature" },
    "window-interval": { name: "Window open duration",role: "value" },
    "up": { name: "Shutter command UP",role: "command" },
    "down": { name: "Shutter command DOWN",role: "command" },
    "stop": { name: "Shutter command STOP",role: "command" },
    "preset1": { name: "Shutter command PRESET1",role: "command" },
    "preset2": { name: "Shutter command PRESET2",role: "command" },
}


function createChannel(device,id,name,role) {
    adapter.setObject(device + '_' + id, {
        type: 'channel',
        common: {
            "name": name,
            "role": (role ? role : type),
            "room": 'none'
        },
        native: {
            "id": id
        }
    });
}

function createObjectState(state,id,value) {
    var dev = state;
    if ( id  ) {
        dev = 'device_' + id + '.' + state;
    }
    adapter.log.debug("createObjectState: " + dev + " => " + value);
    adapter.setObject(dev, {
        type: 'state',
        common: {
            "name": (state in roles ? roles[state]['name'] : state),
            "type": typeof value,
            "role": (state in roles ? roles[state]['role'] : 'indicator')
        },
        native: {}
    }, function (err, obj) {
        if ( value ) {
            adapter.setState(dev, value, true);
        }
    } );
}

function strftime(sFormat, date) {
  if (!(date instanceof Date)) date = new Date();
  var nDay = date.getDay(),
    nDate = date.getDate(),
    nMonth = date.getMonth(),
    nYear = date.getFullYear(),
    nHour = date.getHours(),
    aDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    aMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    aDayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
    isLeapYear = function() {
      return (nYear%4===0 && nYear%100!==0) || nYear%400===0;
    },
    getThursday = function() {
      var target = new Date(date);
      target.setDate(nDate - ((nDay+6)%7) + 3);
      return target;
    },
    zeroPad = function(nNum, nPad) {
      return ((Math.pow(10, nPad) + nNum) + '').slice(1);
    };
  return sFormat.replace(/%[a-z]/gi, function(sMatch) {
    return (({
      '%a': aDays[nDay].slice(0,3),
      '%A': aDays[nDay],
      '%b': aMonths[nMonth].slice(0,3),
      '%B': aMonths[nMonth],
      '%c': date.toUTCString(),
      '%C': Math.floor(nYear/100),
      '%d': zeroPad(nDate, 2),
      '%e': nDate,
      '%F': date.toISOString().slice(0,10),
      '%G': getThursday().getFullYear(),
      '%g': (getThursday().getFullYear() + '').slice(2),
      '%H': zeroPad(nHour, 2),
      '%I': zeroPad((nHour+11)%12 + 1, 2),
      '%j': zeroPad(aDayCount[nMonth] + nDate + ((nMonth>1 && isLeapYear()) ? 1 : 0), 3),
      '%k': nHour,
      '%l': (nHour+11)%12 + 1,
      '%m': zeroPad(nMonth + 1, 2),
      '%n': nMonth + 1,
      '%M': zeroPad(date.getMinutes(), 2),
      '%p': (nHour<12) ? 'AM' : 'PM',
      '%P': (nHour<12) ? 'am' : 'pm',
      '%s': Math.round(date.getTime()/1000),
      '%S': zeroPad(date.getSeconds(), 2),
      '%u': nDay || 7,
      '%V': (function() {
              var target = getThursday(),
                n1stThu = target.valueOf();
              target.setMonth(0, 1);
              var nJan1 = target.getDay();
              if (nJan1!==4) target.setMonth(0, 1 + ((4-nJan1)+7)%7);
              return zeroPad(1 + Math.ceil((n1stThu-target)/604800000), 2);
            })(),
      '%w': nDay,
      '%x': date.toLocaleDateString(),
      '%X': date.toLocaleTimeString(),
      '%y': (nYear + '').slice(2),
      '%Y': nYear,
      '%z': date.toTimeString().replace(/.+GMT([+-]\d+).+/, '$1'),
      '%Z': date.toTimeString().replace(/.+\((.+?)\)$/, '$1')
    }[sMatch] || '') + '') || sMatch;
  });
}

var map_cmd = { 'move(1)': 'down', 'move(-1)': 'up', 'move(0)': 'stop', 'movepreset(1)': 'preset1', 'movepreset(2)': 'preset2' };
var map_cc = { 'down': ['move', 1], 'up': ['move', -1], 'stop': ['move',0], 'preset1': ['movepreset',1], 'preset2': ['movepreset',2] };

var shutter_duration;
var positions;

function dict_to_array(d) {
    var a = [];
    for (var x in d) {
        a.push([x,d[x]]);
    }
    return a;
}
/*
 * Callbacks for PostResponse
 */
function evaluateLog(error, command, deviceId, result) {
    if (error) {
        adapter.log.error('Error for "' + command + "': " + error);
        return;
    }
    if( 'result' in result && 'log' in result['result']) {
    	var logs = result['result']['log'];
        //adapter.log.debug('-----------------------------------------------');
        adapter.log.debug('evaluateLog: START'); // + JSON.stringify(logs));
        adapter.getState('lastlogtime', function (err,state) {
            if (err) {
                adapter.log.error("evaluateLog: "+JSON.stringify(err));
                return;
            }
            var lasttime = state ? state.val : "0000-00-00_00:00:00";
            var list = {};
            for (var i=logs.length-1; i>0; i-- ) {
                var event = logs[i];
                if ( event['type'] != 'item-event' ) continue;
                //adapter.log.debug("evaluateLog: Loop: " + i+ ", " + JSON.stringify(event));
                var id = event['item'];
                var date = event['date'] + "_" + event['time'];
                if ( date <= lasttime && false ) break;
                if ( event['message'].indexOf('Command') > -1) {
                    var cmd1 = event['message'].replace(/.*Command (.*) for.*/,`$1`);
                    if ( ! ( cmd1 in map_cmd ) ) continue;
                    var cmd = map_cmd[cmd1];
                    //adapter.log.debug("evaluateLog: " + id+": "+cmd );
                }
                else if ( event['message'].indexOf('trigger')>-1 ) {
                    var sender = event['message'].replace(/.*Sender ([^\"]*).*/,`$1`);
                    var cmd = event['message'].replace(/.*trigger \"(\w*)\".*/,`$1`).replace("pos","preset");
                    if ( ! ( sender in devicemap ) ) continue;
                    id = devicemap[sender];
                    //adapter.log.debug("evaluateLog: " + date + "(" + lasttime + ") Remote " + sender + "("+id+"): "+cmd);
                }
                else {
                    adapter.log.debug("evaluateLog: Unknown: " + id + ": " + JSON.stringify(event['message']));
                    continue;
                }
                if ( ! (id in list) ) {
                    if ( cmd == "stop" ) {
                        list[id] = [{t: parseFloat(event['time_internal'])}];
                    }
                    else {
                        list[id] = [ {pos: positions[cmd]} ];
                    }
                }
                else if ( 't' in list[id][0] ) {
                        var dt = parseFloat(list[id][0]['t']) - parseFloat(event['time_internal']);
                        //adapter.log.debug("evaluateLog: finish: "+ id + ", " + JSON.stringify(list[id])+", " + max_durations[id]);
                        if ( dt > 30 && cmd != "stop" ) {
                            // stop chain here
                            var p = positions[cmd];
                            for ( var j=1; j<list[id].length; j++ ) {
                                p += list[id][j]["dt"] * list[id][j]["direction"] / max_durations[id] * 100.0;
                            }
                            list[id] = [ { pos: p } ];
                        }
                        else {
                            // continue chain
                            list[id].unshift( {t: parseFloat(event['time_internal']) } );
                            list[id][1] = {"dt": dt, "direction": map_cc[cmd][1]};
                        }
                }
            }
            for ( var id in list ) {
                var p = list[id][0]["pos"];
                adapter.log.info(`evaluateLog: setState: device_${id}.position: ` + p);
                adapter.setState(`device_${id}.position`,p, true);
            }
            var acttime = strftime('%F_%H:%M:%S',new Date());
            //adapter.log.debug(`evaluateLog: setState: lastlogtime:` + acttime);
            adapter.setState('lastlogtime',acttime,true);
        });
    }
}

function change_presence_states(trigger) {
    adapter.getStates('*.trigger.' + trigger, (error,devices) => {
        if (error) {
            adapter.log.error('change_presence_state: Error for "' + trigger + "': " + error);
            return;
        }
        for ( var dev in devices ) {
            var devname = dev.replace(/.*\.(\w*)\.trigger\..*/g,"$1");
            var state = devices[dev];
            if ( state ) {
                var [s,cmd,act] = state.val.split("/");
                adapter.log.warn("change_presence_state: " + devname + ": " + cmd + ", " + act);
                if ( check_schedule(s) ) {
                    adapter.log.debug("CHANGE_PRESENCE_STATES: schedule passed. Change state.");
                    adapter.setState(devname + "." + cmd, act, false);
                }
                else {
                    adapter.log.debug("CHANGE_PRESENCE_STATES: schedule failed. Do nothing.");
                }
            }
        }
    });
}
function updateDevices(err,devices) {
    for (var x of devices ) {
        var id = x.native.id;
        if ( x.common.role == "thermostat" ) {
            adapter.log.debug("THERMOSTAT: " + id + ", " + JSON.stringify(x));
            postResponse('deviced.hvac_zone_get_mode', id, {
                hvac_id: id
            }, getValue );
        }
    }
}

function getValue(error, command, deviceId, result ) {
    if (error) {
        adapter.log.error('getValue: Error for "' + command + "': " + error);
        return;
    }
    adapter.log.debug('getValue: ' + command + '('+deviceId+'): ' + JSON.stringify(result));
    var dev = "device_" + deviceId + ".";
    if ( command == 'deviced.hvac_zone_get_mode' ) {
        adapter.setState(dev + 'mode', result.result.mode, true );
        postResponse('deviced.hvac_zone_get_temperature', deviceId, {
            hvac_id: deviceId,
            mode: result.result.mode
        }, getValue);
    }
    else if (command == 'deviced.hvac_zone_get_temperature') {
        adapter.setState(dev + 'temp', result.result.temp, true );
    }
}

function evaluateConfig(error, command, deviceId, result) {
    if (error) {
        adapter.log.error('Error for "' + command + "': " + error);
        return;
    }
    adapter.log.debug('evaluateConfig: ' + command + '('+deviceId+'): ' + JSON.stringify(result));
    if ( command == 'deviced.item_get_config' ) {
        if ( 'temp-comfort' in result.result.config ) {
            postResponse('deviced.hvac_zone_get_mode',deviceId,{ hvac_id: deviceId },evaluateConfig);
        }
    }
    else if ( command == 'deviced.hvac_zone_get_mode' ) {
        if ( 'result' in result && 'mode' in result['result'] ) {
            var mode = result['result']['mode'];
            createObjectState('mode',deviceId,mode);
            postResponse('deviced.hvac_zone_get_temperature', deviceId, {
                hvac_id: deviceId,
                mode: mode
            }, evaluateConfig);
        }
    }
    else if (command == 'deviced.hvac_zone_get_temperature') {
        if ( 'result' in result && 'temp' in result['result'] ) {
            createObjectState('temp',deviceId,result['result']['temp']);
        }
        else {
            createObjectState('temp',deviceId,-1);
        }
    }
}

function printResult(error, command, deviceId, result) {
	adapter.log.info("INFO: "+command+" RESULT("+deviceId+"): "+JSON.stringify(result));
}


function evaluateItemsList(error, command, deviceId, result) {
    if (error) {
        adapter.log.error('Error for "' + command + "': " + error);
        return;
    }
    adapter.log.debug('evaluating items list for command "' + command + '": ' + JSON.stringify(result));

    if ('result' in result) {
        if ('item_list' in result['result']) {
            createObjectState('lastlogtime',null,"0000-00-00_00:00:00");
            for (var item of result['result']['item_list']) {
                if (item['type'] == 'group' && item.backend ) {
                    if ('backend' in item) {  // physical object
                        var x = item['name'].match(/\s*\((h)\)\s*/i) || ['', 'l'];
                        if (x[0]) {
                            item['name'] = item['name'].replace(x[0], '');
                        }
                        createChannel('device', item['id'], item['name'], item['device_type']);
                        postResponse('deviced.item_get_config', item['id'], {item_id: item['id']}, evaluateConfig);
                        if (item['device_type'] == 'shutter') {
                            devicemap[item['name']] = item['id']
                            max_durations[item['id']] = shutter_duration[x[1]];
                            createObjectState("max_duration", item['id'], shutter_duration[x[1]]);
                            createObjectState("position", item['id'], 0);
                            createObjectState('command', item['id'], '');
                        }
                        else if (item['device_type'] == 'thermostat') {
                            //postResponse('deviced.item_get_info', item['id'], {item_id: item['id']}, printResult);
                            //postResponse('deviced.item_get_state', item['id'], {item_id: item['id']}, printResult);
                        }
                        //createObjectState("schedule",item.id);
                    }
                    else {
                        //createChannel('group', item['id'], item['name'], item['device_type']);
                    }
                }
                else if (item['type'] == 'room') {
                    //createChannel('room', item['id'], item['name'], 'room');
                }
                else if (item['type'] == 'remote') {  // remote sender
                    createChannel('device', item['id'], item['name'], 'remote');
                    createObjectState('remote_type', item['id'], item['remote_type'], 1);
                    createObjectState('trigger', item['id'], 'none', 1);
                }
                else if (item['type'] == 'scene') {

                }
                else if (item['type'] == 'favorite') {

                }
                else if (item['type'] == 'commandset') {

                }
                else if (item['type'] == 'command') {

                }
            }
        }
    }
}


/*
 * Execute POST request to CCx1 controller
 */

var methods = {
	    // Complete System
	    "deviced.deviced_get_room_names": {},
	    "deviced.deviced_get_automatic": {},
	    "deviced.deviced_get_item_list": {},
	    "deviced.deviced_log_get": { "params": { "include": ["item-event"]}},
	    // Rooms
	    "deviced.room_get_items": { "args": ["room_id"], "params": {"item_type": "group"} },
	    "deviced.room_get_automatic": { "args": ["room_id"] },
	    // Devices
	    "systemd.log_top_event_id_read": { "args": ['group_id'] },
	    "deviced.item_get_state": { "args": ["item_id"] },
	    "deviced.item_set_name": { "args": ["item_id", "name"]},
	    "deviced.item_get_info": { "args": ["item_id"]  },
	    "deviced.item_get_config": { "args": ["item_id"] },
	    "deviced.item_set_config": { "args": ["item_id","config"] },
	    "deviced.item_delete": { "args": [ "item_id" ] },
	    "deviced.group_send_command": { "args": ["command","group_id","value"]},
	    "deviced.command_new": { "args": ["command","parent_id","item_id","value"], "params": {"target": "deviced"} },
	    // Timers
	    "deviced.clock_new": { "args": ["name"] },
	    "deviced.clock_get_info": { "args": ["clock_id"]  },
	    "deviced.clock_set_time": { "args": [ "clock_id","time","days" ] },
	    "deviced.clock_set_features": { "args": ["clock_id","block_time"] },
	    "deviced.clock_set_active": { "args": ["clock_id","active"] },
	    // Climate zones
	    "deviced.hvac_zone_get_mode": { "args": ["hvac_id"] },
	    "deviced.hvac_zone_set_mode": { "args": ["hvac_id","mode"] },
	    "deviced.hvac_zone_get_temperature": { "args": ["hvac_id","mode"] },
	    "deviced.hvac_zone_set_temperature": { "args": ["hvac_id","mode","temp"] },
	    "deviced.hvac_zone_set_schedule": { "args": ["hvac_id","enabled","schedule"] },
	    "deviced.hvac_zone_get_schedule": { "args": ["hvac_id"] },
	};

function postResponse(command, deviceId, args, callback){
    //adapter.log.debug("postResponse: " + command + "(" + deviceId + ")" + JSON.stringify(args));
    id_count += 1;
    var body = { method: command, id: id_count,jsonrpc: '2.0', params: {} };
    if (  command in methods ) {
        if ( 'params' in methods[command] ) {
            body['params'] = methods[command]['params'];
        }
        if ( "args" in methods[command] ) {
            for ( var key of methods[command]['args'] ) {
                if ( key in args ) {
                    body["params"][key] = args[key];
                }
            }
        }
    }
    else {
        if (callback) {
            callback('Command not known', command, deviceId);
            callback = null;
        }
        return;
    }
    var body_string = JSON.stringify(body);

    var options = {
        host:    adapter.config.ipaddress,
        port:    '80',
        path:    '/cgi-bin/cc51rpc.cgi?t=' + (new Date).getTime(),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': body_string.length}
    };
    //adapter.log.debug('creating request for command "' + command + '" (deviceId: ' + deviceId + ', host: ' + options.host + ', port: ' + options.port + ', path: "' + options.path + '")');
    //adapter.log.debug("request: options:" + JSON.stringify(options));
    //adapter.log.debug("request: body:" + body_string);

    var req = http.request(options, function(res) {
        var pageData = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            pageData += chunk;
        });
        res.on('end', function () {
            if (res.statusCode == 200) {
                //adapter.log.warn("data:" + pageData);
                if ( pageData ) {
                    var result = JSON.parse(pageData);
                    if (callback) {
                        callback(null, command, deviceId, result);
                        callback = null;
                    }
                    return;
                }
            }
            else {
                if (callback) {
                    callback('HTTP error: ' + res.statusCode.toString(), command, deviceId);
                    callback = null;
                }
            }
            });
    });
    req.on('error', function(e) {
        if (callback) {
            callback('received error: ' + e.message, command, deviceId);
            callback = null;
        }
    });
    req.write(body_string);
    req.end();
}

function get_all_items_once() {
    postResponse('deviced.deviced_get_item_list',null,{},evaluateItemsList);
}

function encode_schedule(array_of_days,time,months,days_of_months) {
    var hour = "*", min = "*", aod = "*";
    if ( array_of_days ) {
        aod = array_of_days.join(',');
    }
    if ( time ) {
        time = time.replace(':', '');
        hour = parseInt(time.substr(0, 2));
        min = parseInt(time.substr(2, 2));
    }
    var m = "*";
    if ( months && Array.isArray(months) ) {
        m = months.join(",");
    }
    var dom = "*";
    if ( days_of_months && Array.isArray(days_of_months) ) {
        dom = days_of_months.join(",");
    }
    return min + " " + hour + " " + dom + " " + m + " " + aod;
}

function decode_schedules(sched) {
    var [min,hour,dom,months,d,rest] = sched.split(" ");
    adapter.log.warn("DECODE: " + sched + ": " + [min,hour,dom,months,d,rest].join(", "));
    var array_of_days = (d != "*") ? d.split(",").map(Number) : undefined;
    var m = (months != "*") ? months.split(",") : undefined;
    var dom = (dom != "*") ? dom.split(",") : undefined;
    var time = undefined;
    if ( ! (min == "*" && hour == "*") ) {
        time = ("0" + hour).slice(-2) + ":" + ("0" + min).slice(-2);
    }
    return [ array_of_days, time, m, dom ];
}

function check_schedule(sched) {
    var now = new Date();
    var arr = sched.split(" ");
    var array_of_days = (arr[4] != "*") ? d.split(",").map(Number) : [0,1,2,3,4,5,6];
    if ( ! ( now.getDay() in array_of_days) ) { return false; }
    adapter.log.debug("CHECK:SCHEDULE: " + arr.join(",") + ", " + now.getHours() + ":" + now.getMinutes() );
    if ( arr[1] == "*" || now.getHours() >= Number(arr[1]) ) {
        if ( arr[0] == "*" || now.getMinutes() >= Number(arr[0]) ) {
            return true;
        }
    }
    return false;
}

function read_data() {
    data_dir = adapter.adapterDir.substr(0,adapter.adapterDir.indexOf('node_modules')) + "iobroker-data/files/becker/";
    schedules_file = data_dir + "schedules.json";
    adapter.log.debug("Read schedules from: " + schedules_file);
    if ( fs.existsSync(schedules_file) ) {
        var json = fs.readFileSync(schedules_file);
        //adapter.log.debug(json);
        schedules = JSON.parse(json);
        var scheds = { "schedule": {}, "present": {}, "absent": {}};
        for (var s of schedules ) {
            if (s.trigger in scheds) {
                scheds[s.trigger][s.id] = [];
                adapter.log.debug(JSON.stringify(s));
                //adapter.log.debug("cron: " + "device_" + s.id + ": " + encode_schedule(s.days,s.time,s.months,s.dom) + "/" + s.command)
                scheds[s.trigger][s.id].push(encode_schedule(s.days, s.time, s.months, s.dom) + "/" + s.state + "/" + s.action);
            }
        }
        for ( var t in scheds ) {
            for ( var id in scheds[t] ) {
                var s = scheds[t][id];
                createObjectState("trigger." + t, id, s.join(";"));
            }
        }
    }
    else {
        adapter.log.warn("schedules.json not found");
        schedules = [];
    }
}

function save_data() {
    adapter.getStates("becker.0.*", (error,devices) => {
        if (error) {
            adapter.log.error('save_data: Error for "' + command + "': " + error);
            return;
        }
        var schedule = [];
        //adapter.log.warn(JSON.stringify(devices));
        for (var dev in devices ) {
            var state = devices[dev];
            if ( dev.indexOf(".trigger.")>-1 && state && state.val ) {
                adapter.log.warn("save_data: dev: " + dev + ", " + state.val);
                var id = dev.replace(/.*device_(\d*)\..*/g, "$1");
                var trigger = dev.replace(/.*trigger\./g, "");
                var [s, cmd, act] = state.val.split("/");
                //adapter.log.debug("TRIGGER: " + id + ", " + cmd + ", " + act + ", " + trigger + ", " + s);
                var x = {id: id, trigger: trigger, state: cmd, action: act};
                [x.days, x.time, x.months, x.dom] = decode_schedules(s);
                //adapter.log.debug("sched: " + JSON.stringify(x));
                schedule.push(x);
            }
        }
        adapter.log.debug("Write schedules: " + JSON.stringify(schedule));
        fs.writeFileSync(schedules_file,JSON.stringify(schedule));
    });
}

function main() {

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.info("CONFIG: " + JSON.stringify(adapter.config));
    shutter_duration = { h: adapter.config.seconds_h, l: adapter.config.seconds_l }; // seconds for complete closure of shutters
    positions = { 'up': 0, 'down': 100, 'preset1': adapter.config.pos_preset1, 'preset2': adapter.config.pos_preset2 };
    adapter.log.info('loglevel: '+adapter.common.loglevel);

    if (adapter.config.ipaddress === '' || adapter.config.ipaddress === '0.0.0.0') {
        adapter.log.error('Please specify IP address');
        return;
    }
    get_all_items_once();
    read_data();

    adapter.subscribeStates('*');
    adapter.subscribeForeignStates('javascript.0.Anwesenheit.state');
    //postResponse("deviced.deviced_log_get", null, {}, evaluateLog);
    //adapter.getChannels( updateDevices  );
    var cronJob = cron.job("0 */5 * * * *", function(){
        adapter.log.debug("CRON: fetch becker event log...");
        postResponse("deviced.deviced_log_get", null, {}, evaluateLog);
        adapter.getChannels( updateDevices  );
        save_data();
    });
    cronJob.start();
    setTimeout( function () { save_data() }, 5000);
}
