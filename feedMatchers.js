var addTorrent = require('./transmission').addTorrent;

exports.feedMatchers = [
    {
        url: 'http://horriblesubs.info/rss.php?res=1080',
        fileRegexes: [
            /^\[HorribleSubs\] Dr\. Stone - /
        ],
        loader: (url) => addTorrent(url, 'videos/Shows/Dr. Stone')
    },
    {
        url: 'http://horriblesubs.info/rss.php?res=1080',
        fileRegexes: [
            /^\[HorribleSubs\] Boku no Hero Academia - /
        ],
        loader: (url) => addTorrent(url, 'videos/Shows/Boku no Hero Academia')
    },
    {
        url: 'http://horriblesubs.info/rss.php?res=1080',
        fileRegexes: [
            /^\[HorribleSubs\] One Piece - /
        ],
        loader: (url) => addTorrent(url, 'videos/Shows/One Piece')
    },
    {
        url: 'http://horriblesubs.info/rss.php?res=1080',
        fileRegexes: [
            /^\[HorribleSubs\] Dragon Ball Super - /
        ],
        loader: (url) => addTorrent(url, 'videos/Shows/Dragon Ball Super')
    }
];
