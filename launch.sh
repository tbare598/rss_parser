#!/usr/bin/bash
echo $$ > /var/run/node/rss_parser.pid;
cd /www/rss_parser
exec /usr/bin/node /www/rss_parser/app.js
