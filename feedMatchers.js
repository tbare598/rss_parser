var addTorrent = require('./transmission').addTorrent;

exports.feedMatchers = [
    {
        url: 'http://horriblesubs.info/rss.php?res=1080',
        fileRegexes: [
            /^\[HorribleSubs\] One Piece - /
        ],
        loader: function(item) {
            addTorrent(item.link, 'videos/Shows/One Piece');
        }
    },
    {
        url: 'http://horriblesubs.info/rss.php?res=1080',
        fileRegexes: [
            /^\[HorribleSubs\] Dragon Ball Super - /
        ],
        loader: function(item) {
            addTorrent(item.link, 'videos/Shows/Dragon Ball Super');
        }
    }
];
