define([
	'angular',

	'fontoxml-ui-buttons/uiModule',
	'fontoxml-ui-modal/uiModule',
	'fontoxml-ui-regions/uiModule',
	'fontoxml-ui-panels/uiModule',

	'./ui/SpecialCharacterModalController'
], function (
	angular,

	uiButtonsUiModule,
	uiModalUiModule,
	uiRegionsUiModule,
	uiPanelsUiModule,

	SpecialCharacterModalController
	) {
	'use strict';

	var module = angular.module('fontoxml-ui-special-characters', [
			uiButtonsUiModule,
			uiModalUiModule,
			uiRegionsUiModule,
			uiPanelsUiModule
		]);

	module.controller('SpecialCharacterModalController', SpecialCharacterModalController);

	return module.name;
});
