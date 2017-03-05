var sizeEl = document.querySelector('.size'); // MB
var testNumberEl = document.querySelector('.testNumber');
var progressId = document.querySelector('.progress');

function createElementWithNode(str) {
    var el = document.createElement('li');
    el.append(str);
    progressId.append(el);
}
document.querySelector('button').addEventListener('click', function() {
    createElementWithNode('Starting...');

    if (testNumberEl.value == 1) {

        setTimeout(function() {
            runTest1();
        }, 500);
    } else if (testNumberEl.value == 2) {

        setTimeout(function() {
            runTest2();
        }, 500);
    } else if (testNumberEl.value == 3) {

        setTimeout(function() {
            runTest2();
        }, 500);
    }
});

function runTest1() {
    var heapSize = parseInt(sizeEl.value, 10);

    if (!heapSize) {
        alert('Please input size in MB 0 < x < 50');
    }

    var buffer = new ArrayBuffer(1024 * 1024 * heapSize) // reserves 10 MB
    var view = new Uint8Array(buffer) // view the buffer as bytes
    var numPrimes = 0

    performance.mark('testStart')
    for (var i = 0; i < view.length; i++) {
        var primeCandidate = i + 2 // 2 is the smalles prime number
        var result = isPrime(primeCandidate)
        if (result) numPrimes++
            view[i] = result
    }
    performance.mark('testEnd')
    performance.measure('runTest', 'testStart', 'testEnd')
    var timeTaken = performance.getEntriesByName('runTest')[0].duration

    createElementWithNode(`Done. Found ${numPrimes} primes in ${timeTaken} ms`);
    console.log(numPrimes, view)
}

function runTest2() {
    var heapSize = parseInt(sizeEl.value, 10);

    if (!heapSize) {
        alert('Please input size in MB 0 < x < 50');
    }

    var buffer = new ArrayBuffer(1024 * 1024 * heapSize)
    var view = new Uint8Array(buffer) // view the buffer as bytes

    performance.mark('testStart')

    var worker = new Worker('prime-worker.js')
    worker.onmessage = function(msg) {
        performance.mark('testEnd')
        performance.measure('runTest', 'testStart', 'testEnd')
        var timeTaken = performance.getEntriesByName('runTest')[0].duration
        view.set(new Uint8Array(buffer), 0)

        createElementWithNode(`Done. Found ${msg.data.numPrimes} primes in ${timeTaken} ms`);
        console.log(msg.data.numPrimes, view)
    }

    worker.postMessage(buffer, [buffer])
}

function runTest3() {
  var heapSize = parseInt(sizeEl.value, 10);

  if (!heapSize) {
      alert('Please input size in MB 0 < x < 50');
  }

  const TOTAL_NUMBERS = 1024 * 1024 * heapSize
  const NUM_WORKERS = 4
  var numbersToCheck = TOTAL_NUMBERS, primesFound = 0
  var buffer = new SharedArrayBuffer(numbersToCheck) // reserves 10 MB
  var view = new Uint8Array(buffer) // view the buffer as bytes

  performance.mark('testStart')
  var offset = 0
  while(numbersToCheck) {
    var blockLen = Math.min(numbersToCheck, TOTAL_NUMBERS / NUM_WORKERS)
    var worker = new Worker('prime-worker.js')
    worker.onmessage = function(msg) {
      primesFound += msg.data.numPrimes

      if(msg.data.offset + msg.data.length === buffer.byteLength) {
        performance.mark('testEnd')
        performance.measure('runTest', 'testStart', 'testEnd')
        var timeTaken = performance.getEntriesByName('runTest')[0].duration
        
        createElementWithNode(`Done. Found ${primesFound} primes in ${timeTaken} ms`);
        console.log(primesFound, view)
      }
    }

    worker.postMessage({
      buffer: buffer, // SharedArayBuffers can't be transferred
      offset: offset,
      length: blockLen
    })

    numbersToCheck -= blockLen
    offset += blockLen
  }
}

function isPrime(candidate) {
    for (var n = 2; n <= Math.floor(Math.sqrt(candidate)); n++) {
        if (candidate % n === 0) return false
    }
    return true
}
