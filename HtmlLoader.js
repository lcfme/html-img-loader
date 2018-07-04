#! /usr/bin/env node

var fs = require('fs');
var stream = require('stream');
var util = require('util');
var htmlTransform = require('./htmlTransform');

module.exports = HtmlLoader;

function HtmlLoader(opts) {
    var plugins = [], currentPlugin;
    if (!(this instanceof HtmlLoader)) return new HtmlLoader(opts);
    if (Array.isArray(opts.plugin)) {
        plugins = opts.plugin;
        delete opts.plugin;
    }
    plugins.unshift(HtmlTranStream);
    plugins = plugins.map(function(plugin) {
        return typeof plugin === 'string' ? require(require.resolve(plugin))(opts) : plugin(opts);
    });
    this.stream = fs.createReadStream(opts.filename);
    while (currentPlugin = plugins.shift()) {
        this.stream = this.stream.pipe(currentPlugin);
    }
    return this.stream;
}

function HtmlTranStream(opts) {
    if (!(this instanceof HtmlTranStream)) return new HtmlTranStream(opts);
    this._opts = Object.assign({ size: 512 }, opts);
    if (!this._opts.filename) {
        throw new Error('options --filename must be given');
    }
    stream.Transform.call(this);
    this._data = '';
}

util.inherits(HtmlTranStream, stream.Transform);

HtmlTranStream.prototype._transform = function(chunk, enc, callback) {
    this._data += chunk;
    callback();
};

HtmlTranStream.prototype._flush = function(callback) {
    var code = htmlTransform(this._data, this._opts);
    this.push(code);
    callback();
};
