/*
The MIT License (MIT)

Copyright (c) 2016 Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

'use strict';

const request = require('request');
const gamepad = require('gamepad');

const BOT_ADDRESS = '192.168.1.105';
const BOT_PORT = 8000;

let x = 0, y = 0;

gamepad.init();

setInterval(gamepad.processEvents, 16);
setInterval(gamepad.detectDevices, 500);

gamepad.on('move', function (id, axis, value) {
  switch(axis) {
    case 0:
      x = value;
      break;
    case 1:
      y = value;
      break;
    case 2:
      x = value;
      break;
    case 3:
      y = value;
      break;
    case 4:
      y = (value + 1) / 2;
      break;
    case 5:
      y = -(value + 1) / 2;
      break;
  }
});

function update() {
  request({
    uri: `http://${BOT_ADDRESS}:${BOT_PORT}/update`,
    method: 'POST',
    json: true,
    body: { x, y }
  }, () => setTimeout(update, 30));
}
update();
