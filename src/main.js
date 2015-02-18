define([
	'angular',

	'./SpecialCharacterController'
], function(
	angular,

	SpecialCharacterController
	) {
	'use strict';

	var module = angular.module('fontoxml-ui-special-characters', []);

	module.controller('SpecialCharacterModalController', SpecialCharacterController);

	return {
		module: module
	};
});
