'use strict';
const request = require('request');
const validUrl = require('valid-url');
const parseTorrent = require('parse-torrent');
const morgan = require('morgan');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.use(morgan('dev'));

app.get('/', (req, res) => {
	res.send('Try sending a url!');
});

app.get('/*', (req, res) => {
	const url = req.params[0];
	if (validUrl.isUri(url)) {
		// URL was sent as param
		getTorrent(url)
			.then(data => {
				res.json(data);
			})
			.catch(err => {
				console.log(err.stack);
				const {name, message, statusCode} = err;
				res.status(statusCode || 400)
					.json({
						error: {
							name,
							message
						}
					});
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
				return reject(errorHandler('Request Failed', `Status Code: ${statusCode}`, statusCode));
			} else if (!/^application\/x-bittorrent/.test(contentType)) {
				return reject(errorHandler('Invalid content-type', `Expected application/x-bittorrent but received ${contentType}`));
			} else if (err) {
				return reject(errorHandler('Request Failed', `The following error was encountered: ${err}`));
			}

			const parsedData = parseTorrent(body);
			const pick = (obj, ...props) => Object.assign({}, ...props.map(prop => ({[prop]: obj[prop]})));
			const magnetData = pick(parsedData, 'name', 'infoHash', 'infoHashBuffer', 'announce');
			const torrentData = pick(parsedData, 'name', 'created', 'comment', 'infoHash', 'announce', 'files');
			const magnetURI = parseTorrent.toMagnetURI(magnetData);

			return resolve({magnetURI, torrentData});
		});
	});
}

function errorHandler(name, message, statusCode = null) {
	const stack = new Error(`${name} - ${message}`);
	return {
		name,
		message,
		stack,
		statusCode
	};
}

app.listen(port, () => {
	console.log(`App listening on port ${port}.`);
});
