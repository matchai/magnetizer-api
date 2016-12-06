<h1 align="center">
	<br>
	<img width="500" src="https://cdn.rawgit.com/matchai/magnetizer-api/master/media/logo-text.svg" alt="Magnetizer">
	<br>
	<br>
</h1>

> API - Converts direct links to torrents into magnet links

## Install

```
$ npm install
$ npm start
```

*A local instance of magnetizer will be running at http://localhost:8080.*

## API

#### <code>GET</code> /:url

Returns the magnet URI and data for a torrent

##### Parameters

- __url__ – The full URL (including protocol) to a torrent file.

##### Return format
- __magnetURI__ – The complete magnetURI of the torrent file.
- __torrentData__ – The torrent data attainable from the torrent header.
  - __name__ – Name as specified by the torrent creator.
  - __created__ – The date the torrent was created in ISO 8601 format.
  - __comment__ – Comment as specified by the torrent creator.
  - __infoHash__ – The SHA1 hash sums of the torrent's meta files.
  - __announce__ – An array of URLs of all tracker announces for the torrent.
  - __files__ – An array containing all files and their paths in the torrent.

## License

MIT © [Matan Kushner](https://matchai.me)
