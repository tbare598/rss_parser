var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var config = require('./config');

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
    feedMatcher.files.push({
        regexes: regexes,
        loadLocation: loadLocation
    });

    var data = JSON.stringify(feedMatchers);
    fs.writeFileSync('feedMatchers.json', data);
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Method': '*'
    });
    res.send('{"status": "complete" }');
}

app.post(
    '/feed-matcher/api/add',
    (req, res) => addFeedMatcher(res, req.body)
);

app.listen(PORT, () => console.log('Server listening on port '+ PORT));
