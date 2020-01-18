var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var config = require('./config');
var transmission = require('./transmission');

var app = express();
const PORT = config.port;

app.use(bodyParser.json());

function addFeedMatcher(res, newFeedMatcher) {
    console.log(newFeedMatcher);
    var rssURL = newFeedMatcher.rssURL;
    var regexes = newFeedMatcher.regexes;
    var loadLocation = newFeedMatcher.loadLocation;

    delete require.cache[require.resolve('./feedMatchers.json')];
    var feedMatchers = require('./feedMatchers.json');

    var feedMatcher = feedMatchers.find(feedMatcher => feedMatcher.url === rssURL);
    if(feedMatcher == null) {
        feedMatcher = {
            url: rssURL,
            files: []
        };
        feedMatchers.push(feedMatcher);
    }
    const id = new Date().getTime();
    feedMatcher.files.push({
        id: id,
        regexes: regexes,
        loadLocation: loadLocation
    });

    updateFeedMatcherJson(feedMatchers);
    res.send(`{"status": "New Feed ${id} Added", "id": ${id} }`);
}

function updateFeedMatcher(res, newFeedMatcher) {
    console.log(newFeedMatcher);
    var id = newFeedMatcher.id;
    var rssURL = newFeedMatcher.rssURL;
    var regexes = newFeedMatcher.regexes;
    var loadLocation = newFeedMatcher.loadLocation;

    delete require.cache[require.resolve('./feedMatchers.json')];
    var feedMatchers = require('./feedMatchers.json');
    var performAdd = false;

    const matchFound = feedMatchers
        .some(feedMatcher => {
            const matchingFile = feedMatcher.files
                .find(file => file.id === id);
            if (matchingFile) {
                if (feedMatcher.url === rssURL) {
                    matchingFile.regexes = regexes;
                    matchingFile.loadLocation = loadLocation;
                // If we updated the url, then we have to remove it from this feed
                // matcher, and then just add it as a new feed matcher
                } else {
                    feedMatcher.files = feedMatcher.files
                        .filter(file => file.id !== id);
                   performAdd = true; 
                }
                return true;
            }
            return false;
        });
    if (matchFound && !performAdd) {
        updateFeedMatcherJson(feedMatchers);
        res.send(`{"status": "Feed Matcher ${id} Updated", "id": ${id} }`);
    } else {
        addFeedMatcher(res, newFeedMatcher);
    }
}

function updateFeedMatcherJson(newFeedMatchers) {
    var data = JSON.stringify(newFeedMatchers);
    fs.writeFileSync('feedMatchers.json', data);
}

function showFeedMatchers(res) {
    delete require.cache[require.resolve('./feedMatchers.json')];
    const feedMatchers = require('./feedMatchers.json');
    res.send(JSON.stringify(feedMatchers));
}

function addTorrent(res, newTorrent) {
    transmission.addTorrent(newTorrent.url, newTorrent.location)
        .then(() => {
            console.log('Torrent Added - ' + newTorrent.url);
            res.send('{ "status" : "Torrent Added" }');
        });
}

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    return req.method === 'OPTIONS'
         ? res.send(200)
         : next(); 
});

app.use(
    '/feed-matcher/src',
    express.static(path.join(__dirname, 'script-injector'))
);

app.get(
    '/feed-matcher/api/all',
    (req, res) => showFeedMatchers(res)
);

app.post(
    '/feed-matcher/api/add',
    (req, res) => addFeedMatcher(res, req.body)
);

app.post(
    '/feed-matcher/api/update',
    (req, res) => updateFeedMatcher(res, req.body)
);

app.post(
    '/transmission/api/add-torrent',
    (req, res) => addTorrent(res, req.body)
);

app.listen(PORT, () => console.log('Server listening on port '+ PORT));
