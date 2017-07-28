define([
	'fontoxml-modular-ui/uiManager',

	'./ui/FxSpecialCharacterModal.jsx',
	'./specialCharactersManager',

	'json!./character-sets/defaultCharacterSet.json'
], function (
	uiManager,

	FxSpecialCharacterModal,
	specialCharactersManager,

	defaultCharacterSetJson
) {
	'use strict';

	return function install () {
		uiManager.registerReactComponent('FxSpecialCharacterModal', FxSpecialCharacterModal);

		specialCharactersManager.addCharacterSet('default', defaultCharacterSetJson);
	};
});
