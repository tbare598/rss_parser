// const HOST = 'https://192.168.0.202:9876';
const HOST = 'http://127.0.0.1:8765';
window.localStorage.setItem('feed-matcher-host', HOST);

var $script = document.createElement('script');
$script.src = 'https://code.jquery.com/jquery-1.11.0.min.js';
$script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild($script);

runScript();

function runScript() {
    if( window.$ ) {
        var dlFormScript = document.createElement('script');
        dlFormScript.src = HOST + '/feed-matcher/src/download-form.js';
        dlFormScript.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(dlFormScript);
        
        var hsClickDLScript = document.createElement('script');
        hsClickDLScript.src = HOST + '/feed-matcher/src/horriblesubs-click-downloader.js';
        hsClickDLScript.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(hsClickDLScript);
    } else {
        window.setTimeout( runScript, 50 );
    }
}

