define([
	'editor'
], function (
	editor
	) {
	'use strict';

	var smuflLabels = [];
	var smuflCharacters = [];

	// Suggestions for user stories:
	// - As a user I can see which label I'm currently browsing, so that I won't be confused as to what I'm looking at.
	// - As a user I can not see characters named "Unused", because they are obviously unused.

	/**
	 * One codepoint, one string
	 * @param {String} codePoint
	 * @returns {String}
	 */
	function codePointToString (codePoint) {
		return String.fromCodePoint(parseInt(codePoint.substr(2), 16));
	}

	function characterToString(character) {
		return character.codePoints.map(codePointToString).join();
	}

	/**
	 * Concatenate all codepoints for the given characters into a single string.
	 * @param {Object[]} characters
	 * @returns {String}
	 */
	function charactersToString (characters) {
		return characters.map(characterToString).join();
	}

	/**
	 * Get all characters that have the given label as (one of) the parent(s).
	 * @param {Object} label
	 * @returns {Object[]}
	 */
	function getCharactersByLabel (label) {
		return smuflCharacters.filter(function(character) {
			return character.labels.indexOf(label.name) >= 0;
		});
	}

	/**
	 * Get all characters that have the given substring in the character name.
	 * @param {String} searchedString
	 * @returns {Object[]}
	 */
	function getCharactersByMatchedName (searchedString) {
		return smuflCharacters.filter(function(character) {
			return character.name.toLowerCase().indexOf(searchedString) >= 0;
		})
	}

	/**
	 * Get all labels that have the given substring in label name.
	 * @param {String} searchedString
	 * @returns {Object[]} Label names
	 */
	function getLabelsByMatchedName (searchedString) {
		return smuflLabels.filter(function(label) {
			return label.name.toLowerCase().indexOf(searchedString) >= 0;
		});
	}

	/**
	 * Get all labels that have any of the given characters as child.
	 * @param {Object[]} characters
	 * @returns {String[]} Label names
	 */
	function getLabelsContainingCharacters (characters) {
		var labelsWithFilteredCharacters = [];
		characters.forEach(function(character) {
			character.labels.forEach(function(labelName) {
				if(labelsWithFilteredCharacters.indexOf(labelName) === -1) {
					labelsWithFilteredCharacters.push(labelName);
				}
			});
		});
		return characters;
	}

	/**
	 * Loops through all characters to gather information about the various labels once (like character
	 * count, character range, etc.). The gathered information can later be used to order the UI with.
	 * @returns {Array}
	 */
	function preprocessLabels() {
		var labelsByName = {};

		smuflCharacters.forEach(function (character) {
			character.labels.forEach(function (labelName) {
				if (!labelsByName[labelName]) {
					labelsByName[labelName] = {
						name: labelName,
						count: 0,
						characterRangeStart: null,
						characterRangeEnd: null
					};
				}

				var labelInfo = labelsByName[labelName];
				labelInfo.count += 1;

				character.codePoints.forEach(function(codePoint) {
					var weight = parseInt(codePoint.substr(2), 16);
					if (labelInfo.characterRangeStart === null || weight < labelInfo.characterRangeStart) {
						labelInfo.characterRangeStart = weight;
					}
					if (labelInfo.characterRangeEnd === null || weight > labelInfo.characterRangeEnd) {
						labelInfo.characterRangeEnd = weight;
					}
				});
			});
		});

		return Object.keys(labelsByName).map(function (labelName) {
			return labelsByName[labelName];
		});
	}

	smuflCharacters = editor.getSmuflCharacters();
	smuflLabels = preprocessLabels();

	return /* @ngInject */ function ($scope, $sce) {
		var filteredLabels = [],
			filteredCharacters = [],
			labelsWithFilteredCharacters = [];

		// Scope variables
		$scope.labels = smuflLabels;
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
				character.html = $sce.trustAsHtml(characterToString(character));
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

		function filter (searchedString, previousInput) {
			if (searchedString === previousInput) {
				return;
			}

			if(!searchedString) {
				return resetFilter();
			}

			searchedString = searchedString.toLowerCase();

			filteredLabels = getLabelsByMatchedName(searchedString);

			filteredCharacters = getCharactersByMatchedName(searchedString);

			labelsWithFilteredCharacters = getLabelsContainingCharacters(filteredCharacters);
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
