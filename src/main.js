define([
	'angular',

	'./specialCharacterControllerDefinition'
], function(
	angular,

	specialCharacterControllerDefinition
	) {
	'use strict';

	var module = angular.module('ui-special-characters', []);

	module.controller('SpecialCharacterModalController', specialCharacterControllerDefinition);

	return {
		module: module
	};
});
