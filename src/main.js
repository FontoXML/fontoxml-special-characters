define([
	'angular',

	'./SpecialCharacterController'
], function(
	angular,

	SpecialCharacterController
	) {
	'use strict';

	var module = angular.module('ui-special-characters', []);

	module.controller('SpecialCharacterModalController', SpecialCharacterController);

	return {
		module: module
	};
});
