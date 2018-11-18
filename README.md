# benchtest v1.2.0

Integrated performance testing for Mocha based unit testing.

Benchtest provides performance testing wrapper around the [Mocha](https://mochajs.org/) unit test runner. It can be used as a light weight, but not as quite as powerful, alternative to the stellar [benchmark.js](https://github.com/bestiejs/benchmark.js) library.

Benchtest set-up can be done in as little as three lines of code for [Node](https://nodejs.org/en/) projects.

```
const benchtest = require("benchtest");
afterEach(function () { benchtest.test(this.currentTest); });
after(() => benchtest.run({log:"md"}));

```

Afterwards a Markdown compatible table containing performance results for all successful tests similar to the one below will be printed to the console:


| Name                  | Ops/Sec  | +/- | Sample Size |
| --------------------- | -------- | --- | ----------- |
| no-op #               | Infinity | 0   | 99          |
| sleep 100ms #         | 10       | 7   | 21          |
| sleep 100ms Promise # | 10       | 26  | 21          |
| sleep random ms #     | 21       | 96  | 35          |
| loop 10000 #          | Infinity | 0   | 85          |
| use heap #            | Infinity | 0   | 96          |


In the browser `benchtest` requires just one line of code after loading the library! This `onload` call adds performance testing to all Mocha unit tests.

```
<body onload="benchtest(mocha.run(),{all:true})">
```

The browser results will be augmented like below:

&check; no-op # Infinity sec +/- 0 100 samples

&check; sleep 100ms # 10 sec +/- 2 11 samples 108ms

&check; sleep 100ms Promise # 10 sec +/- 2 11 samples 101ms

&check; sleep random ms # 21 sec +/- 99 100 samples 45ms

&check; loop 10000 # Infinity sec +/- 0 95 samples

&check; use heap # Infinity sec +/- 0 95 samples


# Installation

npm install benchtest --save-dev

# Usage

Whenever you do performance tests, if the code will ever be used in a browser, we recommend you test across ALL browsers and not use Node.js results as a proxy. Node.js performance results are rarely the same as browsers results. In general we find Chrome fastest, Firefox next and Edge a distant third despite Microsoft's claims that Edge is the fastest.

See the test in the `test` directory for an example of how to use.

## Node

Just add two global Mocha event hooks to include tests to be benchmarked and then run the benchmarks after Mocha has completed unit testing. Benchtest will automatically exclude tests that have failed.

```javascript
const benchtest = require("benchtest");
afterEach(function () { benchtest.test(this.currentTest); });
after(() => benchtest.run());

```

Add a `#` to the end of each unit test name you wish to benchmark, or just pass `all:true` in the options to run.

If there is a point at which you wish to skip all tests except benchmark tests, add this line:

```javascript
beforeEach(function() { if(!benchtest.testable(this.currentTest)) this.currentTest.skip(); })
```

See the API section for options that can be passed to `benchtest.run()`.

## Browser

Load the benchtest code, `benchtest.js` located in the module `browser` subdirectory using a `script` tag. Assuming your testing is occuring from subdirectory of your project root it should look something like this:

```html
<script src="../node_modules/browser/benchtest.js" type="text/javascript"></script>
```

Add this to your `onload` function or where you normally start Mocha.

```javascript
benchtest(mocha.run());
```

Add a `#` to the end of each unit test name you wish to benchmark, or just pass `all:true` in an options object as the second argument to `benchtest`. See the API section for details.


# API

`Runner benchtest(mochaRunner,options={})` - Used for browser initialization of `benchtest`. The value of `mochaRunner` is the return value of `mocha.run()`. Returns `mochaRunner`. The `options` has this shape with the provided defaults:

```javascript
{minCycles=10,maxCycles=100,sensitivity=.01,log="json",logStream=console,all=false,off=false,only=false}`
```

<ul>
	<li>`minCycles` - The minimum number of times to run a test to assess its performance.</li>
	<li>`maxCycles` - The maximum number of times to run a test to assess its performance.</li>
	<li>`sensisitivity` - The value of the percentage difference (expressed as a float, i.e. .01 = 1%) between individual cycle tests at which point the test loop should exit.</li>
	<li>`log` - The format in which to output results to the `logStream`. Valid values are `md` for Markdown and `json`.</li>
	<li>`logStream` - The stream to which results should be sent. The stream must support the method `log`, e.g. `console.log(...)`, `logstream.log(...)`.</li>
	<li>`all` - Whether or not to benchtest all unit tests. When all is false, only tests with names ending in `#` will be performance tested.</li>
	<li>`only` - Tells Mocha to skip all tests except those marked for benchmarking. Supercedes `all`. </li>
	<li>`off` - Setting to `true` will turn off benchtesting.
</ul>

`benchtest.run(options={})` - Used for Node. The options are the same as for the browser (see above), except `only` is not supported. See the use of `beforeEach` in the Node usage section in place of `only`. Returns `undefined`.

`Test benchtest.test(unitTest)` - Used to add the `unitTest` to those to be benchmarked after Mocha has run all tests, automatically excludes failed tests. Returns the `unitTest`.

`boolean benchtest.testable(unitTest)` - Checks for `#` as last character in test name.

# Known Issues

Unit tests that result in rejected Promises abort the `benchtest` processing. Use `done(Error)` for all your test failures.

# Release History (reverse chronological order)

2018-11-17 v1.1.0 Test suite divisions now supported. Optimized for more precision and reduced variance across test cycles.

2018-07-17 v1.0.0 Switched from `benchmark.js` to `mocha`. Mocha is in wider use. Removed serialization. Dramatically simplified. Margin of Error now in milliseconds. Test suite divisions not currently supported, they should be run from separate files.

2018-02-07 v0.0.7b BETA Adjusted results to conform better to spec.

2018-02-06 v0.0.6b BETA Improved test case and example.

2018-02-06 v0.0.5b BETA Modified cycle behavior and functions. Finalized API.

2018-02-05 v0.0.4a ALPHA Removed context on tests. Can't support with Benchmark.js.

2018-02-04 v0.0.3a ALPHA Fixed Node table rendering for results

2018-02-04 v0.0.2a ALPHA Update results spec. Address some context scope issues.

2018-02-04 v0.0.1a ALPHA Initial public release

# License

MIT License

Copyright (c) 2018 Simon Y. Blackwell, AnyWhichWay, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
