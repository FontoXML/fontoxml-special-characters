define([
	'fontoxml-modular-ui/uiManager',
	'fontoxml-operations/operationsManager',
	'fontoxml-selection/selectionManager',

	'./specialCharactersManager',

	'./ui/SpecialCharacterModalController',

	'text!./sx/operations.json',
	'text!./sx/defaultCharacterSet.json'
], function (
	uiManager,
	operationsManager,
	selectionManager,

	specialCharactersManager,

	SpecialCharacterModalController,

	operationsJson,
	defaultCharacterSetJson
	) {
	'use strict';

	return function install () {
		uiManager.addController('SpecialCharacterModalController', SpecialCharacterModalController);

		operationsManager.addOperations(JSON.parse(operationsJson));

		selectionManager.selectionChangeNotifier.addCallback(function () {
			operationsManager.invalidateOperationStateByOperationName('default-special-character-insert');
		});

		specialCharactersManager.addCharacterSet('default', JSON.parse(defaultCharacterSetJson));
	};
});

