define([
	'text!assets/configuration/smuflCharacters.json'
], function (
	smuflCharacters
	) {
	'use strict';

	// Suggestions for user stories:
	// - As a user I can see which label I'm currently browsing, so that I won't be confused as to what I'm looking at.
	// - As a user I can not see characters named "Unused", because they are obviously unused.

	function codePointToString (codePoint) {
		return String.fromCodePoint(parseInt(codePoint.substr(2), 16));
	}

	function charactersToString (characters) {
		return characters.map(function(character) {
			return character.codePoints.map(codePointToString);
		});
	}

	function getCharactersByLabel (label) {
		return smuflCharacters.filter(function(character) {
			return character.labels.indexOf(label.name) >= 0;
		});
	}

	/**
	 * Loops through all characters to gather information about the various labels once (like character
	 * count, character range, etc.). The gathered information can later be used to order the UI with.
	 * @returns {Array}
	 */
	function preprocessLabels() {
		var labels = {};

		smuflCharacters.forEach(function (character) {
			character.labels.forEach(function (labelName) {
				if (!labels[labelName]) {
					labels[labelName] = {
						name: labelName,
						count: 0,
						characterRangeStart: undefined,
						characterRangeEnd: undefined
					};
				}

				var labelInfo = labels[labelName];

				++labelInfo.count;

				character.codePoints.forEach(function(codePoint) {
					var weight = parseInt(codePoint.substr(2), 16);
					if (labelInfo.characterRangeStart == undefined || weight < labelInfo.characterRangeStart) {
						labelInfo.characterRangeStart = weight;
					}
					if (labelInfo.characterRangeEnd == undefined || weight > labelInfo.characterRangeEnd) {
						labelInfo.characterRangeEnd = weight;
					}
				});
			});
		});

		// Return as an ordered array
		return Object.keys(labels).map(function (labelName) {
			return labels[labelName];
		});
	}

	smuflCharacters = JSON.parse(smuflCharacters);

	return /* @ngInject */ function ($scope, $sce) {
		var filteredLabels = [],
			filteredCharacters = [],
			labelsWithFilteredCharacters = [];

		// Scope variables
		$scope.labels = preprocessLabels();
		$scope.labelCharacters = [];
		$scope.selectedLabel = $scope.labels[0];
		$scope.selectedCharacters = [];

		$scope.sortables = [
			{ attribute: 'name',                name: 'Label name' },
			{ attribute: 'characterRangeStart', name: 'Character range' },
			{ attribute: 'count',               name: 'Number of characters' }
		];

		$scope.search = { // This is the "dot" fix for angular scope digests incarnate!
			filter: undefined,
			sort: $scope.sortables[0]
		};

		// Scope functions
		$scope.selectLabel = selectLabel;
		$scope.selectCharacter = selectCharacter;
		$scope.labelIsSelected = labelIsSelected;
		$scope.labelIsFiltered = labelIsFiltered;
		$scope.characterIsFiltered = characterIsFiltered;
		$scope.labelHasFilteredCharacters = labelHasFilteredCharacters;

		$scope.apply = apply;
		$scope.cancel = cancel;

		function selectCharacter (character) {
			// @TODO: Push onto array selectedCharacters instead of overwrite
			// because inserting multiple special characters with one modal is
			// a different user story.

			$scope.selectedCharacters = [character];
		}

		function characterHtmlSafe (character) {
			if (!character.html) {
				character.html = $sce.trustAsHtml(character.codePoints.map(codePointToString).join());
			}

			return character;
		}

		function selectLabel (label) {
			$scope.selectedLabel = label;
			$scope.labelCharacters = getCharactersByLabel($scope.selectedLabel).map(characterHtmlSafe);
		}

		function labelIsSelected (label) {
			return $scope.selectedLabel === label;
		}
		function labelIsFiltered (label) {
			return filteredLabels.indexOf(label) >= 0;
		}
		function characterIsFiltered (character) {
			return filteredCharacters.indexOf(character) >= 0;
		}
		function labelHasFilteredCharacters (label) {
			return labelsWithFilteredCharacters.indexOf(label.name) >= 0;
		}

		function resetFilter () {
			$scope.search.filter = '';

			filteredLabels = [];
			filteredCharacters = [];
			labelsWithFilteredCharacters = [];
		}

		function filter (input, previousInput) {
			if (input === previousInput) {
				return;
			}

			if(!input) {
				return resetFilter();
			}

			input = input.toLowerCase();

			// Labels meeting the filter criteria
			filteredLabels = $scope.labels.filter(function(label) {
				return label.name.toLowerCase().indexOf(input) >= 0;
			});

			// Characters meeting the filter criteria
			filteredCharacters = smuflCharacters.filter(function(character) {
				return character.name.toLowerCase().indexOf(input) >= 0;
			});

			// Labels containing characters meeting the filter criteria
			labelsWithFilteredCharacters = [];
			filteredCharacters.forEach(function(character) {
				character.labels.forEach(function(labelName) {
					if(labelsWithFilteredCharacters.indexOf(labelName) === -1) {
						labelsWithFilteredCharacters.push(labelName);
					}
				});
			});
		}

		function apply () {
			$scope.$close({
				text: charactersToString($scope.selectedCharacters)
			});
		}

		function cancel () {
			$scope.$dismiss('cancel');
		}

		selectLabel($scope.selectedLabel);

		$scope.$watch('search.filter', filter);

	};
});
