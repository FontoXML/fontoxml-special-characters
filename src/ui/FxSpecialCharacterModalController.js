define([
	'fontoxml-selection/selectionManager',

	'../reactToAngularModalBridge'
], function (
	selectionManager,

	reactToAngularModalBridge
) {
	'use strict';

	/* @ngInject */ function FxSpecialCharacterModalController ($scope, operationData) {
		selectionManager.preventEditorFocus();

		reactToAngularModalBridge.operationData = operationData;

		reactToAngularModalBridge.closeModal = function closeModal () {
			selectionManager.allowEditorFocus();

			$scope.$dismiss();
		};

		reactToAngularModalBridge.onModalSubmit = function onModalSubmit (modalData) {
			selectionManager.allowEditorFocus();

			$scope.$close(Object.assign({}, operationData, modalData));
		};
	}

	return FxSpecialCharacterModalController;
});
