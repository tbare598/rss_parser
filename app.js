var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var feedMatchers = require('./feedMatchers').feedMatchers;

// Check feeds every 5 minutes
checkInterval = 1000 * 60 * 5;
intervalTolerance = 1000;

function setupFeedWatcher(feedMatcher) {
    var req = request(feedMatcher.url);
    var feedparser = new FeedParser([]);
    
    req.on('error', function (error) {
        console.error('ERROR: \n' + error);
    });
    
    req.on('response', function (res) {
        var stream = this; // `this` is `req`, which is a stream
    
        if (res.statusCode !== 200) {
            this.emit('error', new Error('Bad status code'));
        }
        else {
            stream.pipe(feedparser);
        }
    });
    
    feedparser.on('error', function (error) {
        console.error('ERROR: \n' + error);
    });
    
    feedparser.on('readable', function () {
        var stream = this; // `this` is `feedparser`, which is a stream
        var meta = this.meta;
        var item;
    
        while (item = stream.read()) {
            if (feedMatcher.fileRegexes.some(regEx => {

                var publishDate = new Date(item.pubDate);
                var publishDateDiff = (new Date()).getTime() - publishDate.getTime() + intervalTolerance;
                return publishDateDiff < checkInterval && item.title.match(regEx);
	        })) {
                feedMatcher.loader(item);
            }
        }
    });
}

function checkFeeds() {
    feedMatchers.forEach(feedMatcher => setupFeedWatcher(feedMatcher));
}

checkFeeds();
setInterval(checkFeeds, checkInterval);

