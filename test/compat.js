'use strict';

var assert = require('assert');
var fs = require('fs');
var helpers = require('./helpers.js');

var lzma = require('../');

describe('Compressor/Decompressor', function() {
	it('can compress', function(done) {
		var c = new lzma.Compressor();
		
		c.on('finish', done);
		c.end('Hello!');
	});
	
	it('can round-trip', function(done) {
		var enc = new lzma.Compressor();
		var dec = new lzma.Decompressor();
		var outfile = 'test/random.lzma.unlzma';
		var outstream = helpers.fsCreateWriteStream(outfile);
		
		outstream.on('finish', function() {
			assert.ok(helpers.bufferEqual(fs.readFileSync('test/random'), fs.readFileSync(outfile)));
			fs.unlink(outfile);
			done();
		});
		
		fs.createReadStream('test/random').pipe(enc).pipe(dec).pipe(outstream);
	});
});

describe('LZMA.compress()/decompress()', function() {
	it('can compress strings to Buffers', function(done) {
		var LZMA = new lzma.LZMA();
		
		LZMA.compress('Banana', 9, function(result) {
			assert.ok(Buffer.isBuffer(result));
			assert.ok(result.length > 0);
			
			done();
		});
	});
	
	it('can decompress integer arrays', function(done) {
		var LZMA = new lzma.LZMA();
		
		LZMA.decompress(
			[0x5d, 0x00, 0x00, 0x80, 0x00, 0xff, 0xff, 0xff,  0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x21, 0x18,
			 0x49, 0xc6, 0x24, 0x17, 0x18, 0x93, 0x42, 0x5f,  0xff, 0xfd, 0xa2, 0xd0, 0x00], function(result) {
			assert.ok(Buffer.isBuffer(result));
			assert.equal(result.toString(), 'Banana');
			
			done();
		});
	});
	
	it('can decompress typed integer arrays', function(done) {
		var LZMA = new lzma.LZMA();
		
		LZMA.decompress(
			new Uint8Array(
			[0x5d, 0x00, 0x00, 0x80, 0x00, 0xff, 0xff, 0xff,  0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x21, 0x18,
			 0x49, 0xc6, 0x24, 0x17, 0x18, 0x93, 0x42, 0x5f,  0xff, 0xfd, 0xa2, 0xd0, 0x00]), function(result) {
			assert.ok(Buffer.isBuffer(result));
			assert.equal(result.toString(), 'Banana');
			
			done();
		});
	});
	
	it('can round-trip', function(done) {
		var LZMA = new lzma.LZMA();
		
		LZMA.compress('Bananas', 9, function(result) {
			assert.equal(result.toString('base64'), 'XQAAAAT//////////wAhGEnQgnOEP++//7v9AAA=');
			LZMA.decompress(result, function(result) {
				assert.ok(Buffer.isBuffer(result));
				assert.equal(result.toString(), 'Bananas');
				
				done();
			});
		});
	});
});

describe('lzma.compress()/decompress()', function() {
	it('can round-trip', function(done) {
		lzma.compress('Bananas', 9, function(result) {
			assert.equal(result.toString('base64'), '/Td6WFoAAAFpIt42AgAhARwAAAAQz1jMAQAGQmFuYW5hcwAA0aJr3wABGwcS69QXkEKZDQEAAAAAAVla');
			lzma.decompress(result, function(result) {
				assert.ok(Buffer.isBuffer(result));
				assert.equal(result.toString(), 'Bananas');
				
				done();
			});
		});
	});
});
