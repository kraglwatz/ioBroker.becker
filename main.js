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
var cron        = require('cron');
var fs = require("fs");


//you have to require the utils module and call adapter function
const utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
const schedules = require("./schedules");

//you have to call the adapter function and pass a options object
//name has to be set and has to be equal to adapters folder name and main file name excluding extension
//adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.becker.0
var adapter = new utils.Adapter('becker');
var devicemap = {};
var data_dir;
var schedules_file;

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
    adapter.log.debug('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    //adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        var tmp = id.split('.');
        var dp = tmp.pop(); //should always be "state"
        var idx = tmp.pop(); // name of the device
        var deviceId = idx.replace(/device_/,'')*1;
        var val = state.val;
        adapter.log.info(`stateChange action: ${deviceId}:${dp}:${val}:` + (dp == "command"));
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
//        else if ( ['up','down','stop','preset1','preset2'].indexOf(dp)>-1 ) { // execute command
//            move_shutter(deviceId,dp);
//            setState('device_'+deviceId+'.command',dp,1);
//        }
        else if ( dp.indexOf('pos_') == 0 ) {
            let x = dp.replace(/^pos_/,'');
            if ( x in config_states.positions[idx] ) {
                config_states.positions[idx][x] = val;
            }
        }
        else if ( dp == 'position') {
            adapter.log.debug("setState: " + `${idx}.${dp}:${val}`);
            if ( state.val > 100) { val = 100; }
            else if ( state.val <0 ) { val = 0; }
            move_to_pos(deviceId,val);
            setState(`${idx}.prev_position`,val,true);
            setState(`${idx}.position`,val,true);
        }
        else if ( dp == 'command' ) { // execute command
            adapter.log.debug("setState: " + `${idx}.${dp}:${val}`);
            setState(`${idx}.${dp}`,val, true, 1);
            var pos;
            if ( val>=0 && val <=100 ) {
                move_to_pos(deviceId,val);
                setState(`${idx}.prev_position`,val,true);
                setState(`${idx}.position`,val,true);
                }
            else if (val in config_states.positions[idx]) {
                debug("move_shutter: " + val);
                pos = config_states.positions[idx][val];
                move_shutter(deviceId,val);
                setState(`${idx}.position`,val,1);
                setState(`${idx}.prev_position`,val,1);
            }
            else {
                adapter.log.warn("stateChange: undefined argument " + val);
                return;
            }
        }
        else if ( dp == 'getstate' ) { // execute command
            adapter.log.debug('get_state_from_log');
            postResponse('deviced.deviced_log_get', deviceId, {}, evaluateLog);
        }
        else if ( dp == 'readConfig' ) { // execute command
            adapter.log.debug('Read config from device');
            if ( val ) {
                get_all_items_once();
                setState('readConfig',false);
            }
        }
        else if ( dp == 'position' ) { // position change
        }
        else {
            adapter.log.error(`stateChange for '${dp}' not yet implemented.`);
        }
    }
});

function move_shutter(deviceId,cmd) {
    adapter.log.info(`move shutter ${deviceId} to pos ${cmd}`);
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

function move_to_pos(deviceId,val) {
    var idx = `device_${deviceId}`;
    adapter.log.debug(`move_to_pos: ${idx}.position`);
    adapter.getState(`${idx}.prev_position`,(err,state) => {
        adapter.log.debug("move_to_pos: command: seconds: "+val+", "+ state.val);
        if ( val == state.val ) {
            adapter.log.warn("move_to_pos: command: seconds: "+val+" == "+ state.val);
            return;
        }
        var direction = ( val < state.val ) ? "up" : "down";
        var seconds = Math.abs(state.val - val) * config_states['positions'][idx]['seconds'] / 100.0;
        move_seconds(deviceId,direction,seconds);
    });
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
    "command": { name: "last shutter command",role: "command" },
    "max_duration": { name: "duration",role: "time" },
    "position": { name: "closure state of shutter",role: "percentage" },
}

function createChannel(device,properties,callback) {
    debug("createChannel: "+device+", "+JSON.stringify(properties));
    adapter.setObject(device, {
        type: 'channel',
        common: properties,
        native: {
            "id": device
        }
    },callback);
}

function setState(dev,value,confirm) {
    adapter.log.debug(`setState: ${dev} -> ${value} (${confirm})`);
    adapter.setState(dev,value,confirm, function (err) {
        // analyse if the state could be set (because of permissions)
        if (err) adapter.log.error(err);
   });
}

function createObjectState(state,id,value,properties = null) {
    var dev = state;
    if ( id  ) {
        if ( ! isNaN(id) ) {
            id = 'device_' + id;
        }
        dev = id + '.' + state;
    }
    adapter.log.debug("createObjectState: " + dev + " => " + value + ", " + JSON.stringify(properties == null ? {} : properties));
    if ( properties == null ) {
        properties = {
            role: (state in roles) ? roles[state]['role'] : 'indicator',
            name: (state in roles ? roles[state]['name'] : state),
            type: typeof value,
        }
    }
    adapter.setObject(dev, {
        type: 'state',
        common: properties,
        native: {}
    }, function (err, obj) {
        if ( value != null ) {
            setState(dev, value, true);
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
var config_states = { positions: {},timers: {} };
var default_positions = { 'up': 0, 'down': 100, 'preset1': 90, 'preset2': 75 };

var config_file = __dirname + '/becker-config.json';

function dict_to_array(d) {
    var a = [];
    for (var x in d) {
        a.push([x,d[x]]);
    }
    return a;
}

function saveLogToFile(logs) {
    try {
        fs.copyFileSync('/tmp/becker.log', '/tmp/becker.log.1');
    }
    catch (error) {}
    let s = '';
    for (var x in logs) {
        s += JSON.stringify(logs[x]) + '\n';
    }
    fs.writeFileSync('/tmp/becker.log',s);
}

function dump_config_parameters() {
    fs.writeFile(config_file, JSON.stringify(config_states,null,2), (err) => {
        if (err) throw err;
        adapter.log.info('Config data written to file '+ config_file);
    });
}

function map_devices(name) {
    name = name.replace(" Alle","").replace(/\s*\(\w*\)/,"");
    var ids = [];
    for (var s in devicemap ) {
        if ( s.indexOf(name) == 0 ) {
            ids.push(devicemap[s]);
        }
    }
    return ids;
}

function time_diff(a,b) {

}
function evaluateLog(error, command, deviceId, result) {
    if (error) {
        adapter.log.error('Error for "' + command + "': " + error);
        return;
    }
    debug("START: evaluateLog");
    if( 'result' in result && 'log' in result['result']) {
        var logs = result['result']['log'];
        //adapter.log.debug("log file: "+logs)
    	saveLogToFile(logs);
        //adapter.log.debug('-----------------------------------------------');
        adapter.log.debug('evaluateLog: START'); // + JSON.stringify(logs));
        adapter.getState('lastlogtime', function (err,state) {
            if (err) {
                adapter.log.error("evaluateLog: "+JSON.stringify(err));
                return;
            }
            var lasttime = state ? state.val : "0000-00-00_00:00:00";
            var list = {};
            var match_strings = {
                command: [ /Command ((\w+)\([0-9-]+\)) for Device \"([^\"]*)\".*/, function(a) { return [ a[1],map_devices(a[2]), map_cmd[a[0]] ]; } ],
                remote: [ /Remote \"Sender ([^\"]*)\" triggered with trigger "(\w*)\".*/, function(a) { return [ "move", map_devices(a[0]), a[1] ]; } ]
            }
            var tl = {};
            for (var i=logs.length-1; i>0; i-- ) {
                var event = logs[i];
                var date = Date.parse(event['date'] + "T" + event['time'])/1000;
                if ( event['type'] != 'item-event' ) continue;
                for (var x in match_strings ) {
                    var r = event['message'].match(match_strings[x][0]);
                    if ( r != null ) {
                        r.shift();
                        result = match_strings[x][1](r);
                        var element = [ date, result[2] ? result[2].replace("pos","preset") : null ];
                        for ( var j=0; j< result[1].length; j++ ) {
                            var entry = 'device_'+result[1][j];
                            if ( result[0].indexOf("move") > -1 ) {
                                if (  tl[entry] == null ) {
                                    tl[entry] = [ element ];
                                }
                                else {
                                    tl[entry].push(element);
                                }
                            }
                        }
                        break
                    }
                }
            }
            for ( var dev in tl ) {
                var lastpos = null;
                debug("TEST: " + dev + ": " + tl[dev][0][1] + ", " + JSON.stringify(config_states.positions[dev]));
                if ( tl[dev][0][1] != "stop" ) {
                    lastpos = config_states.positions[dev][tl[dev][0][1]];
                }
                else {
                    for (var last = 1; last<tl[dev].length-1; last++) {
                        if ( tl[dev][last][0] - tl[dev][last+1][0] > 30 )  {
                            break;
                        }
                    }
                    lastpos = config_states.positions[dev][tl[dev][last+1][1]];
                    var direction = 0;
                    for ( var j = last; j>0; j-- ) {
                        direction = map_cc[tl[dev][j][1]][1] * (tl[dev][j-1][0] - tl[dev][j][0]);
                        lastpos += direction / config_states.positions[dev].seconds * 100.0;
                        debug("TEST2: "+ dev + ", "+config_states.positions[dev].seconds);
                    }

                }
                adapter.log.debug(`evaluateLog: update State: ${dev}.position: ${parseInt(lastpos)}`);
                setState(`${dev}.position`,parseInt(lastpos), true);
                setState(`${dev}.prev_position`,parseInt(lastpos), true);
                setState(`${dev}.command`,tl[dev][0][1], true);
            }
            var acttime = strftime('%F_%H:%M:%S',new Date());
            adapter.log.debug(`evaluateLog: update lastlogtime:` + acttime);
            setState('lastlogtime',acttime,true);
            adapter.log.debug('evaluateLog: FINISH'); // + JSON.stringify(logs));

        });
    }
}

function updateDevices(err,devices) {
    for (var x of devices ) {
        var id = x.native.id;
        if ( x.common.role == "thermostat" ) {
            adapter.log.debug("THERMOSTAT: " + id + ", " + JSON.stringify(x));
            postResponse('deviced.hvac_zone_get_mode', id, {
                hvac_id: parseInt(id)
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
        setState(dev + 'mode', result.result.mode, true );
        postResponse('deviced.hvac_zone_get_temperature', deviceId, {
            hvac_id: parseInt(deviceId),
            mode: result.result.mode
        }, getValue);
    }
    else if (command == 'deviced.hvac_zone_get_temperature') {
        setState(dev + 'temp', result.result.temp, true );
    }
}

function evaluateConfig(error, command, deviceId, result) {
    if (error) {
        adapter.log.error('Error for "' + command + "': " + error);
        return;
    }
    debug("START: evaluateConfig")
    adapter.log.debug('evaluateConfig: ' + command + '('+deviceId+'): ' + JSON.stringify(result));
    if ( command == 'deviced.item_get_config' ) {
        if ( 'temp-comfort' in result.result.config ) {
            postResponse('deviced.hvac_zone_get_mode',deviceId,{ hvac_id: parseInt(deviceId) },evaluateConfig);
        }
    }
    else if ( command == 'deviced.hvac_zone_get_mode' ) {
        if ( 'result' in result && 'mode' in result['result'] ) {
            var mode = result['result']['mode'];
            createObjectState('mode',deviceId,mode,{type: "string", name: "Temperature mode", role: "mode"});
            postResponse('deviced.hvac_zone_get_temperature', deviceId, {
                hvac_id: parseInt(deviceId),
                mode: mode
            }, evaluateConfig);
        }
    }
    else if (command == 'deviced.hvac_zone_get_temperature') {
        if ( 'result' in result && 'temp' in result['result'] ) {
            createObjectState('temp',deviceId,result['result']['temp'],{type: "number", name: "temperature", role: "value.temperature"});
        }
        else {
            createObjectState('temp',deviceId,-1,{type: "string", name: "Temperature mode", role: "value.temperature"});
        }
    }
}

function printResult(error, command, deviceId, result) {
	adapter.log.info("INFO: "+command+" RESULT("+deviceId+"): "+JSON.stringify(result));
}

var dict_update = function (dict,key,update,multiple = []) {
    if ( ! (key in dict ) ) {
        dict[key] = {}
    }
    for ( var k in update ) {
        if ( k in dict[key] ) {
            if ( multiple.indexOf(k)>-1 ) {
                dict[key][k].push(update[k]);
            }
            else if ( update[k] ) {
                dict[key][k] = update[k];
            }
        }
        else {
            if ( multiple.indexOf(k)>-1 ) {
                dict[key][k] = [ update[k] ];
            }
            else if ( update[k] ) {
                dict[key][k] = update[k];
            }
        }
    }
}

var debug = function(s) {
    adapter.log.debug(s);
}

function evaluateItemsList(error, command, deviceId, result) {
    if (error) {
        adapter.log.error('Error for "' + command + "': " + error);
        return;
    }
    debug("START: evaluateItemsList");
    debug('evaluating items list for command "' + command + '": ' + JSON.stringify(result));

    var index = {};
    if ('result' in result) {
        if ('item_list' in result['result']) {
            //fs.writeFileSync(__dirname+'/itemList.json',JSON.stringify(result['result'],null,2));
            createObjectState('lastlogtime',null,"0000-00-00_00:00:00",{type: "string", name: "time string", role: "time"});

            for (var item of result['result']['item_list']) {
                if ( 'items' in item ) {
                    for ( let x of item['items'] ) {
                        dict_update(index,x,{ [item['type']]: item['name'], hvac_id: item['hvac_id']},['group','scene']);
                    }
                }
                else {
                    var type = item['type'];
                    if ( 'backend' in item && item['type'] == "group ") {
                        type = "device";
                    }
                    dict_update(index,item['id'],{ type: type, name: item['name'], dev: item['device_type'], feedback: item['feedback'], backend: item['backend'] },['group','scene']);
                }
            }
            //fs.writeFileSync(__dirname+"/index.json","INDEX: "+JSON.stringify(index,null,2));
            var devlist = [];
            for ( var id in index ) {
                if ( 'dev' in index[id] ) {
                    let item = index[id];
                    let mydev = `device_${id}`
                    devlist.push(mydev);
                    var name = item['name'];
                    adapter.createDevice(`device_${id}`, {name: name, role: item['dev'], room: item['room']});
                    //createChannel('device', id, {name: name, role: item['dev'], room: item['room']});
                    if (item['dev'] == 'shutter') {
                        var x = name.match(/\s*\((h)\)\s*/i) || ['', 'l'];
                        if (x[0]) {
                            name = name.replace(x[0], '');
                        }
                        devicemap[name] = id;
                        if ( ! (mydev in config_states.positions) ) {
                            config_states.positions[mydev] = {};
                        }
                        if ( ! config_states.positions[mydev]['seconds'] ) {
                            config_states.positions[mydev].seconds = shutter_duration[x[1]];
                        }
                        createObjectState("max_duration", id, config_states.positions[mydev].seconds,{type: "number", name: "time for shutting", role: "seconds"});
                        createObjectState("position", id, 0,{type: "number", name: "shutting state", role: "position"});
                        createObjectState("prev_position", id, 0,{type: "number", name: "previous shutting state", role: "position"});
                        createObjectState('command', id, '',{type: "string", name: "last shutter command", role: "move"});
                        for ( var pos in default_positions ) {
                            if ( ! (pos in config_states.positions[mydev]) ) {
                                config_states.positions[mydev][pos] = default_positions[pos];
                            }
                            createObjectState(`pos_${pos}`, id,config_states.positions[mydev][pos],{type: "number", name: "default shutting state", role: "position"});
                        }
                    }
                    else if (item['dev'] == 'thermostat') {
                        adapter.log.debug("evaluateConfig: "+JSON.stringify(item));
                        postResponse('deviced.item_get_config', id, {item_id: parseInt(id)}, evaluateConfig);
                    }
                }
            }
            debug("Purging obsolete channels...");
            adapter.getChannels((err,chan) => {
                if (err) { adapter.log.warn(err); }
                for (var x in chan ) {
                    var dev = chan[x]["_id"].replace(/^.*\./,"");
                    if ( devlist.indexOf(dev) == -1 ) {
                        debug("Deleting channel "+dev);
                        adapter.deleteChannel(dev,null,(err) => {
                            if (err) { adapter.log.warn("problems when deleting channel "+dev)}
                        });
                        continue;
                    }
                    adapter.getStatesOf(chan[x]["_id"],null,(err,states) => {
                        if (err) { adapter.log.warn(err); }
                        for (var y in states) {
                            let res = states[y]["_id"].match(/^(.*)\.(device_\d+)\.timer_(\d+)\.(.*)/);
                            if ( res && ! config_states['timers'][res[2]][res[3]] ) {
                                adapter.deleteState(`${res[1]}.${res[2]}`,`timer_${res[3]}`,res[4], (err) => {
                                    if (err) { adapter.log.warn("problems when deleting state "+states[y]["_id"])}
                                });
                            }
                        }
                    });
                }
            });
            for (var x in config_states) {
                for (var dev in config_states[x]) {
                    if (devlist.indexOf(dev) == -1) {
                        delete config_states[x][dev];
                    }
                }
            }
            for (var dev in config_states['timers']) {
                for (var timer in config_states['timers'][dev] ) {
                    create_timer_objects(dev,timer,config_states['timers'][dev][timer]);
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

function init_states() {
    debug("START: create_states");
    if ( fs.existsSync(config_file) ) {
        var raw = fs.readFileSync(config_file);
        config_states = JSON.parse(raw);
        adapter.log.debug("read from file: " + JSON.stringify(config_states));
    }
    postResponse('deviced.deviced_get_item_list',null,{},evaluateItemsList);
    adapter.log.info("Create timer states");
}

function update_device_status() {
    postResponse("deviced.deviced_log_get", null, {}, evaluateLog);
    adapter.getChannels( updateDevices  );
}

function create_timer_objects(deviceId,num,entry) {
    debug("START: create_timer_objects()");
    var dev_name;
    if (isNaN(deviceId)) {
        dev_name = deviceId;
    }
    else {
        dev_name = `device_${deviceId}`;
    }
    debug(`create_timer_objects: ${dev_name}, ${num}, ${JSON.stringify(entry)}`);
/*    var timer = {schedule: schedule, command: command, group: group};
    if ( ! ('timers' in config_states) ) {
        config_states['timers'] = {}
    }
    if ( dev_name in config_states['timers'] ) {
        config_states['timers'][dev_name].push(timer);

    }
    else {
        config_states['timers'][dev_name] = [ timer ];
    }*/
    var new_timer = `${dev_name}.timer_${num}`;
    var new_timer_schedule = `${new_timer}.schedule`;
    adapter.log.debug(`create_timer_objects: ${new_timer}`);
    var sched = entry['schedule'];
    if ( typeof sched === "string") {
        // convert from cron format
        sched = schedules.decode_cron(sched);
        debug("converted: "+JSON.stringify(sched));
    }
    createObjectState("command",new_timer,entry['command'],{role: "move",type:"string"});
    createObjectState("group",new_timer,entry['group'],{role: "group",type:"string"});
    createObjectState("schedule",new_timer,entry['schedule'],{role: "schedule",type:"string"});
    createObjectState("time",new_timer_schedule,sched.time,{role: "time",type:"string"});
    createObjectState("days",new_timer_schedule,sched.aod,{role: "list",type:"string"});
    createObjectState("day_of_month",new_timer_schedule,sched.dom,{role: "time",type:"string"});
    createObjectState("month",new_timer_schedule,sched.month,{role: "month",type:"string"});
}

function main() {

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    debug("START: main()");
    adapter.log.info('loglevel: '+adapter.common.loglevel);
    adapter.log.info("CONFIG: " + JSON.stringify(adapter.config));
    shutter_duration = { h: parseInt(adapter.config.seconds_h), l: parseInt(adapter.config.seconds_l) }; // seconds for complete closure of shutters
    adapter.log.debug('positions: '+JSON.stringify(default_positions));

    if (adapter.config.ipaddress === '' || adapter.config.ipaddress === '0.0.0.0') {
        adapter.log.error('Please specify IP address');
        return;
    }
    init_states();
    adapter.log.debug("all items read in");
    adapter.subscribeStates('*');
    var cronJob = cron.job("*/1 * * * *", function(){
        adapter.log.info("CRON: fetch becker event log...");
        update_device_status();
        dump_config_parameters();
        adapter.log.info("CRON: finished...");
    });
    cronJob.start();
}
