define([
	'fontoxml-modular-ui/uiManager',

	'./ui/SpecialCharacterModal.jsx',
	'./specialCharactersManager',

	'json!./character-sets/defaultCharacterSet.json'
], function (
	uiManager,

	SpecialCharacterModal,
	specialCharactersManager,

	defaultCharacterSetJson
) {
	'use strict';

	return function install () {
		uiManager.registerReactComponent('SpecialCharacterModal', SpecialCharacterModal);

		specialCharactersManager.addCharacterSet('default', defaultCharacterSetJson);
	};
});
