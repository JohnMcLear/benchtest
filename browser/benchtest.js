(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
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
*/
(function() {
	let perf = typeof(performance)!=="undefined" ? performance : null;
	if(typeof(module)!=="undefined" && typeof(window)==="undefined") {
		perf = {
				now: require("performance-now"),
				memory: {}
		}
		Object.defineProperty(perf.memory,"usedJSHeapSize",{enumerable:true,configurable:true,writable:true,value:0});
	}
	const ELEMENTS_SEEN = new Set(),
		PERFORMANCE_ACCESS_ERROR = new Error("performance access"),
		PERFORMANCE_PROXY = new Proxy({},{
			get(target,property) {
				throw PERFORMANCE_ACCESS_ERROR
			}
		});
	const benchtest = function(runner,{minCycles=10,maxCycles=100,sensitivity=.01,log="md",logStream=console,all,off,only}={}) {
		benchtest.options = {minCycles:Math.min(minCycles,maxCycles),maxCycles,sensitivity,log,logStream,all,off,only};
		if(runner) {
			runner.on("suite", suite => {
				beforeEach.call(suite,benchtest.test);
				after.call(suite,() => {
					benchtest.report(suite);
					const messages = document.getElementById("messages");
					if(messages) {
						messages.innerHTML = ``
					}
				});
			});
			if(typeof(window!=="undefined")) {
				runner.on("pass",function(test) {
					if(benchtest.testable(test)) {
						const elements = document.getElementsByTagName("H2");
						for(const element of [].slice.call(elements)) {
							if(element.innerText.indexOf(test.title)===0 && !ELEMENTS_SEEN.has(element)) {
								ELEMENTS_SEEN.add(element);
								const span = document.createElement("span"),
									duration = test.performance.duration,
									ops = Math.round(1000/duration),
									variability = Math.round(test.performance.sensitivity*10000/duration)+"",
									max = Math.round(1000/test.performance.min)+"",
									min = Math.round(1000/test.performance.max)+"";
								span.className = "speed";
								span.innerText = ` ${ops} sec +/- ${duration===0 && variability===Infinity ? 0 : variability} min: ${min} max: ${max} ${test.performance.cycles} samples`;
								element.insertBefore(span,element.firstElementChild);
								break;
							}
						}
					}
				});
			}
		}
		return runner;
	};
	benchtest.options = {minCycles:10,maxCycles:100,sensitivity:.01,log:"md",logStream:console};
	benchtest.report = function(doneOrSuite) {
		let widths = {
				title: 4,
				ops: 7,
				variability: 3,
				min: 3,
				max: 3,
				cycles: 6
		};
		const done = typeof(doneOrSuite)==="function" ? doneOrSuite : () => {},
				suite =  typeof(doneOrSuite)==="function" ? SUITE : doneOrSuite;
		if(!suite || !suite.tests) return;
		widths.title = Math.max(suite.title.length,4);
		const results = suite.tests.filter(test => test.performance!=null).map(test => {
			const duration = test.performance.duration,
				ops = Math.round(1000/duration)+"",
				variability = Math.round(test.performance.sensitivity*10000/duration)+"",
				max = Math.round(1000/test.performance.min)+"",
				min = Math.round(1000/test.performance.max)+"",
				cycles = test.performance.cycles+"",
				errors = test.performance.errors+"",
				result = {title:test.title,ops,variability,cycles,min,max,errors};
			widths.title = Math.max(result.title.length,widths.title);
			widths.ops = Math.max(ops.length,widths.ops);
			widths.variability = Math.max(variability.length,widths.variability);
			widths.min = Math.max(min.length,widths.min);
			widths.max = Math.max(max.length,widths.max);
			widths.cycles = Math.max(cycles.length,widths.cycles);
			widths.errors = Math.max(errors.length,widths.errors||"Errors ".length);
			return result;
		});
		if(results.length>0) {
			const {log,logStream} = benchtest.options;
			if(log==="md") {
				const	head = `| ${suite.title.padEnd(widths.title," ")} | ${"Ops/Sec".padStart(widths.ops," ")} | ${"+/-".padStart(widths.variability," ")} | ${"Min".padStart(widths.min," ")} | ${"Max".padStart(widths.max," ")} | ${"Sample".padStart(widths.cycles," ")} | ${"Errors".padStart(widths.errors," ")}|\n`,
					line = `| ${"-".padEnd(widths.title,"-")} | ${"-".padEnd(widths.ops,"-")}:| ${"-".padEnd(widths.variability,"-")}:| ${"-".padEnd(widths.min,"-")}:| ${"-".padEnd(widths.max,"-")}:| ${"-".padEnd(widths.cycles,"-")}:| ${"-".padEnd(widths.errors,"-")} | \n`,
					body = results.reduce((accum,result) => {
						accum += `| ${result.title.padEnd(widths.title," ")} | ${result.ops.padStart(widths.ops," ")} | ${result.variability.padStart(widths.variability," ")} | ${result.min.padStart(widths.min," ")} | ${result.max.padStart(widths.max," ")} | ${result.cycles.padStart(widths.cycles," ")} | ${result.errors.padStart(widths.errors," ")} |\n`;
						return accum;
					},"")
					logStream.log(head+line+body);
			} else if(log==="json") {
				logStream.log(results);
			}
		}
		done();
	};
	let SUITE;
	benchtest.test = async function() {
		const test = arguments[0] || this.currentTest; // don't move arguments[0] to an arg, it breaks Mocha
		if(benchtest.testable(test)) {
			const messages = document.getElementById("messages");
			// declare all variables outside test loop to reduce garbage collection impact
			if(test.parent!==SUITE) {
				SUITE = test.parent;
			}
			const {maxCycles,minCycles,sensitivity} = benchtest.options,
				fn = test.fn;
			let min = Infinity,
				max = -Infinity,
				mean,
				variance,
				resolved,
				begin,
				end = null,
				done = value => { end = perf.now(); resolved = value; return value; },
				duration,
				previous = 0,
				delta,
				start = perf.now(),
				cycles = 0,
				timeout = 0,
				perftime = Math.abs(perf.now()-perf.now());
				computetime = 0,
				durations = [];
			// make test object accessable inside of test
			test.fn = fn.bind(test);
			// use a special proxy so that performance checks are essentailly disabled during test loop
			test.performance = PERFORMANCE_PROXY;
			let errors = 0;
			while(++cycles<maxCycles) {
				if(messages) {
					messages.innerHTML = `Benchtesting ${test.title} cycle ${cycles} ...`
				}
				begin = perf.now();
				try {
					result = await test.fn.call(this,done);
				} catch(e) {
					if(e!==PERFORMANCE_ACCESS_ERROR) {
						errors++;
						continue;
					}
				}
				if(end===null) end = perf.now();
				duration = Math.max(0,(end - begin) - (perftime + computetime));
				begin = perf.now();
				if(timeout===0 && test._timeout>0) {
					this.timeout(test._timeout*(maxCycles+5))
				}
				durations.push(duration);
				delta = Math.abs(duration - previous) / duration;
				max = Math.max(duration,max);
				min = Math.min(duration,min);
				mean = durations.reduce((accum,duration) => accum += duration,0) / durations.length;
				variance = durations.map(duration => duration - mean).reduce((accum,duration) => accum += duration * duration,0)/durations.length;
				// exit if sensitivity criteria met and minCycles have been run
				if(variance / mean <= sensitivity && cycles >= minCycles) {
					computetime += (perf.now() - begin) + perftime;
					break;
				}
				if(variance / mean > 5 && cycles >= minCycles) {
					durations.pop(); // throw out probable GC
				} else {
					previous = duration;
				}
				end = null;
				computetime += (perf.now() - begin) + perftime;
			}
			duration = durations.filter(duration => duration<=0).length / durations.length >= 0.8 ? 0 : (perf.now() - (start + computetime + perftime)) / cycles;
			//duration = (perf.now() - start - computetime - perftime) / cycles;
			const revised = durations.filter(duration => duration!==min && duration!==max);
			const avg = revised.reduce((accum,duration) => accum += duration,0)/revised.length;
			test.performance = {cycles,duration,min,max,sensitivity,errors};
		}
	}
	benchtest.testable = function(test) {
		return test.title[test.title.length-1]==="#";
	}
	if(typeof(module)!=="undefined") module.exports = benchtest;
	if(typeof(window)!=="undefined") window.benchtest = benchtest;
	
}).call(this);
},{"performance-now":2}],2:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);



}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
