const HOST = window.localStorage.getItem('feed-matcher-host');

//TODO: ADD ABILITY TO DELETE FEED MATCHERS
//TODO: SAVE ALL EPISODE TORRENT LINKS
//TODO: ADD CHECKBOX TO LOAD PAST SHOWS

var currId = -1;
var divDownloadForm = document.createElement('div')
function addHTML() {
    $(divDownloadForm).load(HOST + '/feed-matcher/src/download-form.html', () => init());
    $('body').prepend(divDownloadForm);
    divDownloadForm.hidden = true;
}
addHTML();


function init() {
    $('#tblExistingFeedMatchers').hide();
    $('#btnUpdate').click(() => updateClicked());
    $('.entry-title').click(event => titleClicked(event));
    $('#btnShowExisting').click(() => showExistingClicked());
    $('#download-form-stylesheet').attr('href', HOST + '/feed-matcher/src/download-form.css');
}

function sendUpdateRequest(requestData) {
    $.ajax({
        type: 'POST',
        url: HOST + '/feed-matcher/api/update',
        data: JSON.stringify(requestData),
        dataType: "json",
        contentType: 'application/json',
        success: (msg) => {
            setStatus(msg);
            loadNewFeedMatchers() },
        error: () => setStatus('Feed Matcher Load Request Failed')
    });
}

function loadNewFeedMatchers() {
    $.ajax({
        type: 'GET',
        url: HOST + '/feed-matcher/api/all',
        success: res => loadFeedMatchers(res),
        error: () => setStatus('Load Failed')
    });
}

function updateClicked() {
    var txtRssUrl = document.getElementById('txtRssUrl').value;
    var txtRegexes = document.getElementById('txtRegexes').value;
    var txtLoadLocation = document.getElementById('txtLoadLocation').value;

    sendUpdateRequest({
        id: currId,
        rssURL: txtRssUrl,
        regexes: txtRegexes.split(';'),
        loadLocation: txtLoadLocation
    });
}

function feedMatcherClicked(url, file) {
    $(`#tbodyExistingFeedMatchers tr[active]`).removeAttr('active');
    if (file.id === currId) {
        currId = -1;
        return;
    }
    var txtRssUrl = document.getElementById('txtRssUrl');
    var txtRegexes = document.getElementById('txtRegexes');
    var txtLoadLocation = document.getElementById('txtLoadLocation');

    txtRssUrl.value = url;
    txtRegexes.value = file.regexes.join(';');
    txtLoadLocation.value = file.loadLocation;
    currId = file.id;

    $(`#tbodyExistingFeedMatchers tr[value=${file.id}]`).attr('active', '');
}

function titleClicked(event) {
    console.log(event);
    if (event == null || event.target == null) {
        return;
    }
    currId = -1;

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
}

function showExistingClicked() {
    var tbl = $('#tblExistingFeedMatchers')
    if (tbl.is(":visible")) {
        console.log('here');
    }
    loadNewFeedMatchers();
}

function loadFeedMatchers(res) {
    const feedMatchers = JSON.parse(res);

    // Removing rows
    var tableRows = $('#tblExistingFeedMatchers tbody tr');
    if (tableRows) {
        tableRows.remove()
    }

    // Logic for creating rows
    var tbodyExistingFeedMatchers = $('#tbodyExistingFeedMatchers');
    if (tbodyExistingFeedMatchers) {
        feedMatchers.forEach(feedMatcherURL =>
            feedMatcherURL.files.forEach(file =>
                tbodyExistingFeedMatchers.append(
                    $('<tr>').append([
                        $('<td>').text(feedMatcherURL.url),
                        $('<td>').text(file.regexes.join(';')),
                        $('<td>').text(file.loadLocation)
                    ]).attr('value', file.id)
                    .click(() => feedMatcherClicked(feedMatcherURL.url, file))
                )
            )
        );
    }

    $('#tblExistingFeedMatchers').show();
}

function setStatus(newMsg) {
    var msg = newMsg;
    if (msg != null) {
        try {
            if (msg.status != null) {
                msg = msg.status;
            } else {
                msg = JSON.parse(msg).status;
            }
        } catch (e) {
        }
        $('#spanStatus').text(msg);
    }
}
