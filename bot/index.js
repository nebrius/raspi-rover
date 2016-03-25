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

const express = require('express');
const bodyParser = require('body-parser');
const five = require('johnny-five');
const Raspi = require('raspi-io');
const board = new five.Board({
  repl: false,
  io: new Raspi()
});

const FRONT_LEFT_MOTOR = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2.M1;
const FRONT_RIGHT_MOTOR = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2.M4;
const BACK_LEFT_MOTOR = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2.M2;
const BACK_RIGHT_MOTOR = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2.M3;

const DEAD_ZONE = 0.1;
const MAX_SPEED = 255;

board.on('ready', () => {
  const frontLeftMotor = new five.Motor(FRONT_LEFT_MOTOR);
  const frontRightMotor = new five.Motor(FRONT_RIGHT_MOTOR);
  const backLeftMotor = new five.Motor(BACK_LEFT_MOTOR);
  const backRightMotor = new five.Motor(BACK_RIGHT_MOTOR);

  const app = express();
  app.use(bodyParser.json());

  setInterval(() => {
    if (x === 0 && y === 0) {
      frontLeftMotor.stop();
      frontRightMotor.stop();
      backLeftMotor.stop();
      backRightMotor.stop();
      return;
    }
    let left;
    let right;
    let angle = Math.atan2(y, x) /  Math.PI;
    if (angle > 0.5) {
      left = (angle - 0.5) * -4 + 1;
      right = 1;
    } else if (angle > 0) {
      left = 1;
      right = angle * 4 - 1;
    } else if (angle > -0.5) {
      left = angle * 4 + 1;
      right = -1;
    } else {
      left = -1;
      right = (angle + 0.5) * -4 - 1;
    }
    const speed = Math.min(1, Math.sqrt(x * x + y * y));
    if (left < 0) {
      frontLeftMotor.reverse(Math.abs(left) * speed * MAX_SPEED);
      backLeftMotor.reverse(Math.abs(left) * speed * MAX_SPEED);
    } else {
      frontLeftMotor.forward(Math.abs(left) * speed * MAX_SPEED);
      backLeftMotor.forward(Math.abs(left) * speed * MAX_SPEED);
    }
    if (right < 0) {
      frontRightMotor.reverse(Math.abs(right) * speed * MAX_SPEED);
      backRightMotor.reverse(Math.abs(right) * speed * MAX_SPEED);
    } else {
      frontRightMotor.forward(Math.abs(right) * speed * MAX_SPEED);
      backRightMotor.forward(Math.abs(right) * speed * MAX_SPEED);
    }
  }, 30);

  let x = 0, y = 0;
  app.post('/update', (req, res) => {
    x = req.body.x;
    if (Math.abs(x) < DEAD_ZONE) {
      x = 0;
    }
    y = req.body.y;
    if (Math.abs(y) < DEAD_ZONE) {
      y = 0;
    }
    res.send('ok');
  });
  const server = app.listen(8000, () => {
    console.log(`Server listening on port ${server.address().port}`);
  });
});
