'use strict';
const request = require('request');
const validUrl = require('valid-url');
const parseTorrent = require('parse-torrent');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
	res.send('Try sending a url!');
});

app.get('/*', (req, res) => {
	const url = req.params[0];
	if (validUrl.isUri(url)) {
		// URL was sent as param
		getTorrent(url)
			.then(magnet => {
				res.json({
					magnet
				})
				res.send(out);
			})
			.catch((err) => {
				console.log(err.stack);
				res.send(`${err.name}: ${err.message}`);
			});
	} else {
		res.sendStatus(404);
	}
});

function getTorrent(url) {
	return new Promise((resolve, reject) => {
		request({url, encoding: null, timeout: 1500}, (err, res, body) => {
			const statusCode = res.statusCode;
			const contentType = res.headers['content-type'];

			if (statusCode !== 200) {
				return reject(errorHandler('Request Failed', `Status Code: ${statusCode}`));
			} else if (!/^application\/x-bittorrent/.test(contentType)) {
				return reject(errorHandler('Invalid content-type', `Expected application/x-bittorrent but received ${contentType}`));
			} else if (err) {
				return reject(errorHandler('Request Failed', `The following error was encountered: ${err}`));
			}

			const {name, infoHash, infoHashBuffer, announce} = parseTorrent(body);
			const magnet = parseTorrent.toMagnetURI({name, infoHash, infoHashBuffer, announce});

			return resolve(magnet);
		});
	});
}

function errorHandler(name, message) {
	const stack = new Error(`${name} - ${message}`);
	return {
		name,
		message,
		stack
	}
}

app.listen(port, () => {
	console.log(`App listening on port ${port}.`);
});
