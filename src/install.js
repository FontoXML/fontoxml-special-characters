define([
	'fontoxml-modular-ui/uiManager',
	'fontoxml-operations/operationsManager',
	'fontoxml-selection/selectionManager',

	'./specialCharactersManager',

	'./ui/createSpecialCharacterGridDirective',
	'./ui/SpecialCharacterModalController',

	'json!./sx/operations.json',
	'json!./sx/defaultCharacterSet.json'
], function (
	uiManager,
	operationsManager,
	selectionManager,

	specialCharactersManager,

	createSpecialCharacterGridDirective,
	SpecialCharacterModalController,

	operationsJson,
	defaultCharacterSetJson
	) {
	'use strict';

	return function install () {
		uiManager.addDirective('uiSpecialCharacterGrid', createSpecialCharacterGridDirective);

		uiManager.addController('SpecialCharacterModalController', SpecialCharacterModalController);

		operationsManager.addOperations(operationsJson);

		selectionManager.selectionChangeNotifier.addCallback(function () {
			operationsManager.invalidateOperationStateByOperationName('default-special-character-insert');
		});

		specialCharactersManager.addCharacterSet('default', defaultCharacterSetJson);
	};
});
