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

	function UiSpecialCharacterGridController () {
		this.characters = specialCharactersManager.getCharacterSet(this.characterSet)
			.map(function (character) {
				character.html = characterToString(character);
				return character;
			});

		this.operationStateEnabled = operationsManager.getOperationState('insert-text').enabled;

		this.columns = parseInt(this.columns || 8, 10);
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

		operationsManager
			.executeOperation('insert-text', { text: characterToString(character) })
			.catch(function () {
				// Always catch rejection to prevent console warnings, OperationsManager handles actual errors.
			});
	};

	return function createGridSizeSelectorDirective () {
		return {
			restrict: 'E',
			require: ['uiSpecialCharacterGrid', '?^uiDrop'],
			transclude: true,
			templateUrl: require.toUrl('fontoxml-special-characters/ui/ui-special-character-grid-template.html'),
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
