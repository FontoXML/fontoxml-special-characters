define([

], function () {
	'use strict';

	function SpecialCharactersManager () {
		this._characterSetByName = Object.create(null);
	}

	SpecialCharactersManager.prototype.addCharacterSet = function (name, characterSet) {
		this._characterSetByName[name] = characterSet;
	};

	SpecialCharactersManager.prototype.getCharacterSet = function (name) {
		var characterSet = this._characterSetByName[name];
		if (!characterSet) {
			throw new Error('Character set "' + name + '" does not exist.');
		}
		return characterSet;
	};

	return SpecialCharactersManager;
});