define([
	'fontoxml-operations/operationsManager',
	'fontoxml-ui-layers',

	'../specialCharactersManager',
	'../api/characterToString'
], function (
	operationsManager,
	uiLayers,

	specialCharactersManager,
	characterToString
) {
	'use strict';

	var visibleLayerChain = uiLayers.visibleLayerChain;

	/* @ngInject */ function UiSpecialCharacterGridController () {
		this.characters = specialCharactersManager.getCharacterSet(this.characterSet)
			.map(function (character) {
				character.html = characterToString(character);
				return character;
			});

		this._operationName = 'quick-special-character-insert';
		this.operationStateEnabled = operationsManager.getOperationState(this._operationName).enabled;

		this.columns = parseInt(this.columns || 8);
		this.selectableColumns = new Array(this.columns);
		this.selectableRows = new Array(Math.ceil(this.characters.length / this.columns));
	}

	UiSpecialCharacterGridController.prototype.getCharacterAtGridPosition = function (row, column) {
		return this.characters[row * this.columns + column];
	};

	UiSpecialCharacterGridController.prototype.executeOperation = function (character) {
		if (!this.operationStateEnabled) {
			return;
		}

		visibleLayerChain.removeAllLayers();

		operationsManager.executeOperation(this._operationName, {
			text: characterToString(character)
		});
	};

	return function createGridSizeSelectorDirective () {
		return {
			restrict: 'E',
			require: ['uiSpecialCharacterGrid', '?^uiDrop'],
			transclude: true,
			templateUrl: require.toUrl('fontoxml-ui-special-characters/ui/ui-special-character-grid-template.html'),
			replace: false,
			scope: {
				columns: '@',
				characterSet: '@'
			},
			controller: UiSpecialCharacterGridController,
			controllerAs: 'uiSpecialCharacterGrid',
			bindToController: true
		};
	};
});
