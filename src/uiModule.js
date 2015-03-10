define([
	'angular',

	'fontoxml-ui-buttons/uiModule',
	'fontoxml-ui-modal/uiModule',
	'fontoxml-ui-regions/uiModule',
	'fontoxml-ui-panels/uiModule',

	'./SpecialCharacterController'
], function (
	angular,

	uiButtonsUiModule,
	uiModalUiModule,
	uiRegionsUiModule,
	uiPanelsUiModule,

	SpecialCharacterController
) {
	'use strict';

	var module = angular.module('fontoxml-ui-special-characters', [
			uiButtonsUiModule,
			uiModalUiModule,
			uiRegionsUiModule,
			uiPanelsUiModule
		]);

	module.controller('SpecialCharacterModalController', SpecialCharacterController);

	return module.name;
});
