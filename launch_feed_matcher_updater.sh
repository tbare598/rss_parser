#!/bin/bash
echo $$ > /var/run/node/feed_matcher_updater.pid;
cd /www/rss_parser
exec /usr/bin/node /www/rss_parser/feedMatcherUpdater.js
