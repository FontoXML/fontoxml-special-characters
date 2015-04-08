define([
	'fontoxml-modular-schema-experience',

	'text!./sx/operations.json',
	'text!./sx/defaultCharacterSet.json',

	'./specialCharactersManager'
], function (
	modularSchemaExperience,

	operationsJSON,
	defaultCharacterSetJSON,

	specialCharactersManager
	) {
	'use strict';

	var module = modularSchemaExperience.configurator.module('fontoxml-ui-special-characters');

	module.register('operations')
		.addOperations(JSON.parse(operationsJSON));

	specialCharactersManager.addCharacterSet('default', JSON.parse(defaultCharacterSetJSON));

	return module.getModuleName();
});
