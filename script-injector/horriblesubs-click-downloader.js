// const HOST = window.localStorage.getItem('feed-matcher-host');

function addTorrent(url, location) {
    $.ajax({
        type: 'POST',
        url: HOST + '/transmission/api/add-torrent',
        data: JSON.stringify({
            url: url,
            location: location
        }),
        dataType: "json",
        contentType: 'application/json',
        success: (msg) => console.log(`File Added To - ${location}\nFile Added - ${url}`),
        error: () => console.log('Torrent Add Failed')
    });
}

var badgeClicked = (event) => {
    const clickedElm = event.target;
    const episodeContainerElm = clickedElm.parentElement;
    const elmText = episodeContainerElm.innerText;

    const episodeNumber = episodeContainerElm.parentElement.id;
    const episodeQuality = clickedElm.innerHTML;
    const magnetLinkElmId = `${episodeNumber}-${episodeQuality}`;
    const magnetLinkElm = $(`#${magnetLinkElmId} [title="Magnet Link"]`)[0];
    const magnetURL = magnetLinkElm.getAttribute('href');

    const showName = elmText.replace(/(((\d\d\/){2}\d\d)|(Today))[\s\n]*(.*) [\d\.]+ .+/, '$5');
    addTorrent(magnetURL, 'videos/Shows/' + showName);
};

setTimeout(() => {	
    var badges = $('.rls-info-container>.rls-label>.badge');
    badges.click(badgeClicked);
    badges.attr('click-added', '');

    $('.more-button')
        .click(() => {
            setTimeout(() => {	
                var badges = $('.rls-info-container>.rls-label>.badge:not([click-added])');
                badges.click(badgeClicked);
                badges.attr('click-added', '');
            }, 500);
        });
}, 2000);
