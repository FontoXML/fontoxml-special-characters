define([

], function () {
	'use strict';

	function characterToString (character) {
		return character.codePoints.map(function (codePoint) {
			return String.fromCodePoint(parseInt(codePoint.substr(2), 16));
		}).join();
	}

	return characterToString;
});