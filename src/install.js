define([
	'fontoxml-modular-ui/uiManager',
	'fontoxml-operations/operationsManager',

	'./specialCharactersManager',

	'./ui/SpecialCharacterModalController',

	'text!./sx/operations.json',
	'text!./sx/defaultCharacterSet.json'
], function (
	uiManager,
	operationsManager,

	specialCharactersManager,

	SpecialCharacterModalController,

	operationsJson,
	defaultCharacterSetJson
	) {
	'use strict';

	return function install () {
		uiManager.addController('SpecialCharacterModalController', SpecialCharacterModalController);

		operationsManager.addOperations(JSON.parse(operationsJson));

		specialCharactersManager.addCharacterSet('default', JSON.parse(defaultCharacterSetJson));
	};
});

