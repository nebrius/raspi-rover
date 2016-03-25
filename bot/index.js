#!/usr/bin/env node
/*
The MIT License (MIT)

Copyright (c) 2014 Bryan Hughes <bryan@nebri.us>

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

const FORWARD = 'forward';
const FORWARD_RIGHT = 'forward_right';
const FORWARD_LEFT = 'forward_left';
const LEFT = 'left';
const RIGHT = 'right';
const BACK = 'back';
const BACK_LEFT = 'back_left';
const BACK_RIGHT = 'back_right';
const NONE = 'none';

const FULL_SPEED = 128;
const HALF_SPEED = 64;

const FRONT_LEFT_MOTOR = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2.M1;
const FRONT_RIGHT_MOTOR = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2.M4;
const BACK_LEFT_MOTOR = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2.M2;
const BACK_RIGHT_MOTOR = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2.M3;

const CONFIGS = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;

board.on('ready', () => {
  const frontLeftMotor = new five.Motor(FRONT_LEFT_MOTOR);
  const frontRightMotor = new five.Motor(FRONT_RIGHT_MOTOR);
  const backLeftMotor = new five.Motor(BACK_LEFT_MOTOR);
  const backRightMotor = new five.Motor(BACK_RIGHT_MOTOR);

  let previousDirection = NONE;
  function move(direction) {
    if (direction === previousDirection) {
      return;
    }
    previousDirection = direction;
    switch(direction) {
      case FORWARD:
        console.log('Moving forward');
        frontLeftMotor.forward(FULL_SPEED);
        frontRightMotor.forward(FULL_SPEED);
        backLeftMotor.forward(FULL_SPEED);
        backRightMotor.forward(FULL_SPEED);
        break;
      case FORWARD_RIGHT:
        console.log('Moving forward right');
        frontLeftMotor.forward(FULL_SPEED);
        frontRightMotor.forward(HALF_SPEED);
        backLeftMotor.forward(HALF_SPEED);
        backRightMotor.stop();
        break;
      case FORWARD_LEFT:
        console.log('Moving forward left');
        frontLeftMotor.forward(HALF_SPEED);
        frontRightMotor.forward(FULL_SPEED);
        backLeftMotor.stop();
        backRightMotor.forward(HALF_SPEED);
        break;
      case LEFT:
        console.log('Moving left');
        frontLeftMotor.reverse(FULL_SPEED);
        frontRightMotor.forward(FULL_SPEED);
        backLeftMotor.reverse(FULL_SPEED);
        backRightMotor.forward(FULL_SPEED);
        break;
      case RIGHT:
        console.log('Moving right');
        frontLeftMotor.forward(FULL_SPEED);
        frontRightMotor.reverse(FULL_SPEED);
        backLeftMotor.forward(FULL_SPEED);
        backRightMotor.reverse(FULL_SPEED);
        break;
      case BACK:
        console.log('Moving back');
        frontLeftMotor.reverse(FULL_SPEED);
        frontRightMotor.reverse(FULL_SPEED);
        backLeftMotor.reverse(FULL_SPEED);
        backRightMotor.reverse(FULL_SPEED);
        break;
      case BACK_LEFT:
        console.log('Moving back left');
        frontLeftMotor.reverse(HALF_SPEED);
        frontRightMotor.reverse(FULL_SPEED);
        backLeftMotor.stop();
        backRightMotor.reverse(HALF_SPEED);
        break;
      case BACK_RIGHT:
        console.log('Moving back right');
        frontLeftMotor.reverse(FULL_SPEED);
        frontRightMotor.reverse(HALF_SPEED);
        backLeftMotor.reverse(HALF_SPEED);
        backRightMotor.stop();
        break;
      case NONE:
        console.log('Stopping');
        frontLeftMotor.stop();
        frontRightMotor.stop();
        backLeftMotor.stop();
        backRightMotor.stop();
        break;
    }
  }
  move(NONE);

  const app = express();
  app.use(bodyParser.json());
  app.post('/update', (req, res) => {
    const x = req.body.x;
    const y = req.body.y;
    if (y > 0) {
      if (x < 0) {
        move('upleft');
      } else if (x > 0) {
        move(FORWARD_RIGHT);
      } else {
        move(FORWARD);
      }
    } else if (y < 0) {
      if (x < 0) {
        move(BACK_LEFT);
      } else if (x > 0) {
        move(BACK_RIGHT);
      } else {
        move(BACK);
      }
    } else if (x > 0) {
      move(RIGHT);
    } else if (x < 0) {
      move(LEFT);
    } else {
      move(NONE);
    }
    res.send('ok');
  });
  const server = app.listen(8000, () => {
    console.log('Server listening on port ' + server.address().port);
  });
});
