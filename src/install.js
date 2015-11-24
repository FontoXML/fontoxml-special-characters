define([
	'fontoxml-modular-ui/uiManager',

	'./specialCharactersManager',

	'./ui/createSpecialCharacterGridDirective',
	'./ui/SpecialCharacterModalController',

	'json!./character-sets/defaultCharacterSet.json'
], function (
	uiManager,

	specialCharactersManager,

	createSpecialCharacterGridDirective,
	SpecialCharacterModalController,

	defaultCharacterSetJson
	) {
	'use strict';

	return function install () {
		uiManager.addDirective('uiSpecialCharacterGrid', createSpecialCharacterGridDirective);
		uiManager.addController('SpecialCharacterModalController', SpecialCharacterModalController);

		specialCharactersManager.addCharacterSet('default', defaultCharacterSetJson);
	};
});
