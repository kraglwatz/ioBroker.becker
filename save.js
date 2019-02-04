for (var i=logs.length-1; i>0; i-- ) {
    var event = logs[i];
    var date = event['date']+"_"+event['time'];
    adapter.log.debug("Event: "+date);
    if ( event['date'] > lasttime && 'type' in event && event['type'] == 'item-event' ) {
        var id = event['item'];
        if ( event['message'].indexOf('Command') > -1) {
            var cmd = event['message'].replace(/.*Command (\w*)\(([0-9-]*)\).*/,`$1,$2`);
            adapter.log.debug(id+": "+cmd);
        }
        else if ( event['message'].indexOf('trigger')>-1 ) {
            var cmd = event['message'].replace(/.*trigger \"(\w*)\"\.*/,`trigger,$1`);
            adapter.log.debug(id+": "+cmd);
        }
        else {
            adapter.log.debug(id+": "+JSON.stringify(event['message']));
        }
    }
}
adapter.getState(`device_${deviceId}.lastlogtime`, function (err,state) {
    if (err) {
        adapter.log.error("ERROR: "+JSON.stringify(err));
        return;
    }
    var lasttime = state.val;
    var time = strftime('%F_%H:%M:%S',new Date());
    adapter.log.debug("Last check: "+lasttime);
    adapter.log.debug("Time: "+time);
    for (var i=logs.length-1; i>0; i-- ) {
        var event = logs[i];
        var date = event['date']+"_"+event['time'];
        adapter.log.debug("Event: "+date);
        if ( event['date'] > lasttime && 'type' in event && event['type'] == 'item-event' ) {
            var id = event['item'];
            if ( event['message'].indexOf('Command') > -1) {
                var cmd = event['message'].replace(/.*Command (\w*)\(([0-9-]*)\).* /,`$1,$2`);
                adapter.log.debug(id+": "+cmd);
            }
            else if ( event['message'].indexOf('trigger')>-1 ) {
                var cmd = event['message'].replace(/.*trigger \"(\w*)\"\.* /,`trigger,$1`);
                adapter.log.debug(id+": "+cmd);
            }
            else {
                adapter.log.debug(id+": "+JSON.stringify(event['message']));
            }
        }
    }
}) */
