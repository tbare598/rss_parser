var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);
// const HOST = 'http://192.168.0.202:8765';
const HOST = 'http://127.0.0.1:8765';

//TODO: MOVE TO SERVER
//TODO: CHANGE JSON FROM TEST JSON TO PROD JSON
//TODO: ADD ABILITY TO SHOW CURRENT FEED MATCHERS
//TODO: ADD ABILITY TO DELETE FEED MATCHERS
//TODO: ADD ABILITY TO EDIT FEED MATCHERS

var divDownloadForm = document.createElement('div')
function addHTML() {
    divDownloadForm.innerHTML = `
    <style>
        .dl-form-input {
            width: 50%
        }
    </style>
    <div>
        <label>RSS URL</label>
        <input id="txtRssUrl" class="dl-form-input">
    </div>
    <div>
        <label>RegExes (separated by semicolons)</label>
        <input id="txtRegexes" class="dl-form-input">
    </div>
    <div>
        <label>Load Location</label>
        <input id="txtLoadLocation" class="dl-form-input">
    </div>
    <div>    
        <button id="btnLoad">Load</button>
    </div>
    <div> 
        <span id="spanStatus"></span>
    </div>`;

    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(
        divDownloadForm,
        document.getElementById('page'));
    divDownloadForm.hidden = true;
}

function sendRequest(requestData) {
    $.ajax({
        type: 'POST',
        url: HOST + '/feed-matcher/api/add',
        data: JSON.stringify(requestData),
        dataType: "json",
        contentType: 'application/json',
        success: () => console.log('Load Started'),
        error: () => console.log('Load Failed')
    });
}

function createRequestJSON(fileURL, showName) {
	return {
        "arguments": {
            "filename": fileURL,
            "download-dir": "/disk1/transmission/videos/Shows" + showName
        },
        "method": "torrent-add"
	};
};

function loadClicked() {
    var txtRssUrl = document.getElementById('txtRssUrl').value;
    var txtRegexes = document.getElementById('txtRegexes').value;
    var txtLoadLocation = document.getElementById('txtLoadLocation').value;

    sendRequest({
        rssURL: txtRssUrl,
        regexes: txtRegexes.split(';'),
        loadLocation: txtLoadLocation
    });
}

function titleClicked(event) {
    console.log(event);
    if (event == null || event.target == null) {
        return;
    }

    var clickedElm = event.target;
    var showName = clickedElm.innerText;
    console.log(showName);
    if (divDownloadForm.hidden) {
        var txtRssUrl = document.getElementById('txtRssUrl');
        var txtRegexes = document.getElementById('txtRegexes');
        var txtLoadLocation = document.getElementById('txtLoadLocation');

        txtRssUrl.value = 'http://horriblesubs.info/rss.php?res=1080';
        txtRegexes.value = `^\\[HorribleSubs\\] ${showName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')} - `;
        txtLoadLocation.value = 'videos/Shows/' + showName;
    }

    divDownloadForm.hidden = !divDownloadForm.hidden;
    // attemptRequest(createRequestJSON(magnetURL, showName));
}

setTimeout(() => {	
    addHTML();
    $('#btnLoad').click(() => loadClicked());
    $('.entry-title').click(event => titleClicked(event));
}, 1000);
