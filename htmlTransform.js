#! /usr/bin/env node

var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var mime = require('mime');
var base64 = require('base64-js');

module.exports = function(chunk, opts) {
    var $ = cheerio.load(chunk);
    var imgElements = (function(imgElements) {
        return [].slice.call(imgElements).map(function(imgElement) {
            return $(imgElement);
        });
    })($('img'));

    imgElements.forEach(function(imgElement) {
        try {
            var src = imgElement.attr('src');
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
            imgElement.attr('src', base64Str);
        } catch (err) {}
    });

    return $.html();
};
