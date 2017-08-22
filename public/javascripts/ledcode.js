/* eslint-disable */

/* LEDCODE transmit module 1.0
 * Author: xpavlicek, 2017
 */
var Ledcode = function(box){
	if (box === null)
		throw new Error("Ledcode init failed, missing box element.");

	var _box = box;
	var _pattern = [];
	var _index = 0;
	var _repeat = false;
	var _lastFrameTimestamp = 0;
	var HIGH_COLOR = '#fff';
	var LOW_COLOR = '#000';
	var _frameRateData = [];

	_box.style.backgroundColor = LOW_COLOR;

	var log = function(val) {
		console.log(`[LEDCODE] ${val}`);
	}

	var transmitFrame = function(timestamp) {
		// Calculate time from last frame.
		var time = Math.trunc(timestamp - _lastFrameTimestamp);

		// Calculate frame length for debug reasons.
		if (_frameRateData.length < 8)
		{
			_frameRateData.push(time);
		}
		else if (_frameRateData.length == 8)
		{
			var sum = 0;
			for (var i = 0; i < _frameRateData.length; i++) sum += _frameRateData[i];
			var frameLength = Math.round( sum / _frameRateData.length );
			log('Frame length ' + frameLength + ' ms.');
			_frameRateData.push(-1);
		}


		// Time was very short, wait until next frame. (high refresh rate?).
		if (time < 10)
		{
			// Register for next animation frame.
			window.requestAnimationFrame(transmitFrame);
			return;
		}
		else if (time < 28)
		{
			// Advance index.
			_index = (_index + 1) % _pattern.length;
			if (_index == 0 && !_repeat) return;
			// Set value.
			_box.style.backgroundColor = (_pattern[_index] == 1) ? HIGH_COLOR : LOW_COLOR;
			// Store timestamp.
			_lastFrameTimestamp = timestamp;
		}
		else if (time < 46)
		{
			// Frame was skipped.

			// Look if it's a problem..
			var actualValue = _pattern[_index];
			_index = (_index + 1) % _pattern.length;
			if (_index == 0 && !_repeat) return;

			if (actualValue == _pattern[_index])
			{
				// Data are correct, continue.

				// Advance index and set data.
				_index = (_index + 1) % _pattern.length;
				_box.style.backgroundColor = (_pattern[_index] == 1) ? HIGH_COLOR : LOW_COLOR;
				if (_index == 0 && !_repeat) return;

				// Store timestamp.
				_lastFrameTimestamp = timestamp;
			}
			else
			{
				// Data are incorrect, reset.

				// Reset trasmitter.
				_lastFrameTimestamp = timestamp;
				_index = 0;
				_box.style.backgroundColor = LOW_COLOR;
				log('Frame timing error!');
				_frameRateData = [];
			}
		}
		else
		{
			// Lag or first frame. Reset transmitter.
			_lastFrameTimestamp = timestamp;
			_index = 0;
			_box.style.backgroundColor = LOW_COLOR;
			_frameRateData = [];
		}

		// Register for next animation frame.
		window.requestAnimationFrame(transmitFrame);
	};

	var encode = function(data) {

		// Start with preamble for message.
    _pattern = [ 0, 1, 1, 1, 1, 1 ];

		for (var dataIndex = 0; dataIndex < data.length; dataIndex++)
		{
			// Select data.
			var value = data[dataIndex];
			// Convert byte to binary array.
			var binaryByte = [];
			for (var bit = 0; bit < 8; bit++)
			{
				binaryByte.push( value % 2 );
				value = Math.trunc(value / 2);
			}
			binaryByte.reverse();

			// Encode byte and append to pattern.
			var patternState = 0;
			for (var i = 0; i < 8; i++)
			{
				_pattern.push( patternState );
				if (binaryByte[i] == 1) _pattern.push( patternState );
				patternState = (patternState == 0) ? 1 : 0;
			}
		}

		// Add epilogue.
		_pattern.push( 0, 0, 0 );

		// console.log(_pattern);
	};

	return {
		transmit: function(data) {
 			encode(data);
			_lastFrameTimestamp = 0;
			_repeat = 0;
			window.requestAnimationFrame(transmitFrame);
		},
		repeat: function(data) {
			encode(data);
			_lastFrameTimestamp = 0;
			_repeat = 1;
			window.requestAnimationFrame(transmitFrame);
		},
		stop: function() {
			_repeat = false;
		}
	}
};
