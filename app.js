var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var config = require('./config');

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
            var matchedItem = item;
            if (feedMatcher.fileRegexes
                .some(re => !loaded.includes(matchedItem.link) && matchedItem.title.match(re))
	        ) {
                console.log('Found match on: "' + matchedItem.title + '"');
                console.log('loaded:' + loaded);
                feedMatcher.loader(matchedItem.link)
                    .then(() => {
                        console.log('Loaded - ' + matchedItem.title);
                        loaded.push(matchedItem.link);
                    });
            }
        }
    });
}

function checkFeeds() {
    delete require.cache[require.resolve('./feedMatchers')];
    var feedMatchers = require('./feedMatchers').feedMatchers;
    feedMatchers.forEach(feedMatcher => setupFeedWatcher(feedMatcher));
}

checkFeeds();
setInterval(checkFeeds, config.pollingInterval);
