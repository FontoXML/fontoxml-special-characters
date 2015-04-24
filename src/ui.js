define([
	'fontoxml-modular-ui/uiManager',

	'./ui/SpecialCharacterModalController'
], function (
	uiManager,

	SpecialCharacterModalController
	) {
	'use strict';

	uiManager.addController('SpecialCharacterModalController', SpecialCharacterModalController);
});
