var request = require('request');
var process = require('process');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var transmissionSessionId = '';

function getOptions() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic YWRtaW46YXNkZmFzZGY=',
            'X-Transmission-Session-Id': transmissionSessionId
        },
        uri: 'https://192.168.0.202:9092/transmission/rpc/',
        body: '',
        method: 'POST'
    };
}

function setTransmissionSessionId(newId) {
    console.log('Setting transmission session id');
    if (newId != null) {
        transmissionSessionId = newId;
    } else {
        return new Promise(resolve => request(
            getOptions(),
            (error, res) => {
                transmissionSessionId = res.headers['x-transmission-session-id'];
                console.log('Transmission session id set');
                resolve();
            }
        ));
    }
}

exports.addTorrent = (url, location) => {
    console.log("Adding Torrent - " + url);
    console.log("At Location - " + location);
    var form = {
        "arguments": {
            "filename": url,
            "download-dir": "/disk1/transmission/" + location
        },
        "method": "torrent-add"
    };
    var options = getOptions();
    options.body = JSON.stringify(form);

    return new Promise(resolve => {
        var prom = new Promise(resolve => resolve());
        if (options.headers["X-Transmission-Session-Id"] === '') {
            prom = setTransmissionSessionId();
        }
        prom.then(() => {
            options.headers["X-Transmission-Session-Id"] = transmissionSessionId;
            request(
                options,
                (error, res) => {
                    console.log('Response from transmission server:');
                    console.log('  status code - ' + res.statusCode);
                    console.log('  message - ' + res.body);
                    if (!error && res.statusCode == 200) {
                        console.log('File Added To - ' + location)
                        console.log('File Added - ' + url)
                        resolve();
                    } else if (res.statusCode == 409) {
                        setTransmissionSessionId(res.headers['x-transmission-session-id']);
                        exports.addTorrent(url, location)
                            .then(() => resolve());
                    } else {
                        resolve();
                    }
                }
            )
        });
    });
}
