const FeedParser = require('feedparser');
const request = require('request'); // for fetching the feed
const addTorrent = require('./transmission').addTorrent;
const config = require('./config');

var loaded = [];

function setupFeedWatcher(feedMatcher) {
    var req = request(feedMatcher.url);
    var feedparser = new FeedParser([]);
    
    req.on('error', function (error) {
        console.error('ERROR: \n' + error);
    });
    
    req.on('response', function (res) {
        var stream = this; // `this` is `req`, which is a stream
    
        if (res.statusCode !== 200) {
            console.error('ERROR: Bad status code: ' + res.statusCode);
            this.emit('error', new Error('Bad status code'));
        }
        else {
            console.log('Successful response from ' + feedMatcher.url)
            stream.pipe(feedparser);
        }
    });
    
    feedparser.on('error', function (error) {
        console.error('ERROR: \n' + error);
    });
    
    feedparser.on('readable', function () {
        var stream = this; // `this` is `feedparser`, which is a stream
        var item;

        while (item = stream.read()) {
            var currItem = item;
            if (!loaded.includes(currItem.link)) {
                var matchedFile = feedMatcher.files
                    .find(file => file.regexes.some(re => currItem.title.match(new RegExp(re))));
                
                if (matchedFile != null) {
                    console.log('Found match on: "' + currItem.title + '"');
                    addTorrent(currItem.link, matchedFile.loadLocation)
                        .then(() => {
                            console.log('Loaded - ' + currItem.title);
                            loaded.push(currItem.link);
                        });
                }
            }
        }
    });
}

function checkFeeds() {
    delete require.cache[require.resolve('./feedMatchers.json')];
    var feedMatchers = require('./feedMatchers.json');
    feedMatchers.forEach(feedMatcher => setupFeedWatcher(feedMatcher));
}

checkFeeds();
setInterval(checkFeeds, config.pollingInterval);
