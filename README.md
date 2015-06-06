# rctapp

React Native CLI Helper Tools

## Install

### Stable

```
$ npm install -g rctapp
```

### Exciting

```
$ npm install -g git://github.com/bh5-js/rctapp.git
```

## Usage

**Required:** Add `bundleId` prop to your `package.json` and set it to your apps bundleId

Example
```JSON
...
	"bundleId": "com.bodhi5.demo",
...
```

### Start Packager and Babel Watcher
```
$ rctapp dev
```

### Build to sim
```
$ rctapp build-sim
```

### Launch sim
```
$ rctapp launch-sim
```

### Clean Xcode project
```
$ rctapp clean
```

## License

MIT
