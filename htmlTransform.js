#! /usr/bin/env node

var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var mime = require('mime');
var base64 = require('base64-js');

var IMGREGEXP = /(<img[^<>]*?\s+src=["'])([^'"<>+]+?)(['"][^<>]*?>)/gi;

module.exports = function(chunk, opts) {
    return chunk.replace(IMGREGEXP, function($0, $1, $2, $3) {
        try {
            var src = $2;
            var dirname = path.dirname(opts.filename);
            var extname = path.extname(src);
            var destFile = path.resolve(dirname, src);
            var fileData = fs.readFileSync(destFile);
            if (fileData.byteLength > opts.size * 1000)
                throw new Error('file size exceeds max size allowed');
            var base64Str = base64.fromByteArray(fileData);
            var mimeInfo = mime.getType(extname);
            if (!mimeInfo) throw new Error('Unknown mimeType');
            base64Str = 'data:' + mimeInfo + ';base64,' + base64Str;
            return $1 + base64Str + $3;
        } catch (err) {
            return $0;
        }
    });
};
