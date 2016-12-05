'use strict';
const request = require('request');
const validUrl = require('valid-url');
const parseTorrent = require('parse-torrent');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

function getTorrent(url) {
	return new Promise((resolve, reject) => {
		request({url, encoding: null}, (err, res, body) => {
			const statusCode = res.statusCode;
			const contentType = res.headers['content-type'];

			let error;
			if (err) {
				error = new Error(`Request Failed.\n` +
													`The following error was encountered: ${err}`);
			} else if (statusCode !== 200) {
				error = new Error(`Request Failed.\n` +
													`Status Code: ${statusCode}`);
			} else if (!/^application\/x-bittorrent/.test(contentType)) {
				error = new Error(`Invalid content-type.\n` +
													`Expected application/x-bittorrent but received ${contentType}`);
			}

			const {name, infoHash, infoHashBuffer, announce} = parseTorrent(body);
			const magnet = parseTorrent.toMagnetURI({name, infoHash, infoHashBuffer, announce});

			if (error) {
				reject(error);
			} else {
				resolve(magnet);
			}
		});
	});
}

app.get('/', (req, res) => {
	res.send('Try sending a url!');
});

app.get('/*', (req, res) => {
	const url = req.params[0];
	if (validUrl.isUri(url)) {
		// URL was sent as param
		getTorrent(url)
			.then(out => res.send(out));
	} else {
		res.sendStatus(404);
	}
});

app.listen(port, () => {
	console.log(`App listening on port ${port}.`);
});
