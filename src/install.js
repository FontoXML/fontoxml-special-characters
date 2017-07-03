define([
	'fontoxml-modular-ui/uiManager',

	'./specialCharactersManager',

	'./ui/FxSpecialCharacterModal.jsx',
	'./ui/FxSpecialCharacterModalController',

	'json!./character-sets/defaultCharacterSet.json'
], function (
	uiManager,

	specialCharactersManager,

	FxSpecialCharacterModal,
	FxSpecialCharacterModalController,

	defaultCharacterSetJson
	) {
	'use strict';

	return function install () {
		uiManager.addController('FxSpecialCharacterModalController', FxSpecialCharacterModalController);

		uiManager.registerReactComponent('FxSpecialCharacterModal', FxSpecialCharacterModal);

		specialCharactersManager.addCharacterSet('default', defaultCharacterSetJson);
	};
});
