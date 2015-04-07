/**
 * @module fontoxml-ui-special-characters
 */
define([
	'fontoxml-modular-schema-experience',

	'text!./sx/operations.json'
], function (
	modularSchemaExperience,

	operationsJSON
	) {
	'use strict';

	var module = modularSchemaExperience.configurator.module('fontoxml-ui-special-characters');

	module.register('operations')
		.addOperations(JSON.parse(operationsJSON));

	return module.getModuleName();
});
