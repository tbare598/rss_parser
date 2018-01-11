var request = require('request');

var transmissionSessionId = '';

function addTorrent(url, location) {
    var form = {
        "arguments": {
            "filename": url,
            "download-dir": "/disk1/transmission/" + location
        },
        "method": "torrent-add"
    };
    var formStr = JSON.stringify(form);

    request(
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic YWRtaW46cGFzc3dvcmQ=',
                'X-Transmission-Session-Id': transmissionSessionId
            },
            uri: 'http://192.168.0.202:9092/transmission/rpc/',
            body: formStr,
            method: 'POST'
         },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('File Added To - ' + location)
                console.log('File Added - ' + url)
            } else if (error || response.statusCode == 409) {
                transmissionSessionId = response.headers['x-transmission-session-id'];
                addTorrent(url, location);
            }
        }
    );
}

exports.addTorrent = addTorrent;
