define([
	'editor'
], function (editor) {
	'use strict';

	var smuflLabels = [];
	var smuflCharacters = [];

	function codePointToString(codePoint) {
		return String.fromCodePoint(parseInt(codePoint.substr(2), 16));
	}

	function characterToString(character) {
		return character.codePoints.map(codePointToString).join();
	}

	function charactersToString(characters) {
		return characters.map(characterToString).join();
	}

	function getCharactersByLabel(label) {
		return smuflCharacters.filter(function (character) {
			return character.labels.indexOf(label.name) >= 0;
		});
	}

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

				character.codePoints.forEach(function (codePoint) {
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
		}).sort(function (a, b) {
			if (a.name === b.name) {
				return 0;
			}
			return a.name < b.name ? -1 : 1;
		});
	}

	smuflCharacters = editor.getSmuflCharacters();
	smuflLabels = preprocessLabels();

	return /* @ngInject */ function ($scope, $sce) {

		var labels = smuflLabels,
			selectedLabel,
			labelCharacters;

		$scope.displayedCharacters = [];
		$scope.displayedLabels = [];

		$scope.selectedCharacters = [];

		$scope.sortables = [
			{ attribute: 'name', name: 'Label name' },
			{ attribute: 'characterRangeStart', name: 'Character range' }
		];

		$scope.search = {
			filter: undefined,
			sort: $scope.sortables[0]
		};

		$scope.selectLabel = selectLabel;
		$scope.labelIsSelected = labelIsSelected;
		$scope.selectCharacter = selectCharacter;

		$scope.apply = apply;
		$scope.cancel = cancel;

		function characterHtmlSafe(character) {
			if (!character.html) {
				// &#8202; is added to avoid the Chromium-specific bug that obstructs rendering zero-width characters:
				// https://code.google.com/p/chromium/issues/detail?id=281402
				character.html = $sce.trustAsHtml('&#8202;' + characterToString(character));
			}

			return character;
		}

		function selectCharacter(character) {
			// @TODO: Push onto array selectedCharacters instead of overwrite
			// because inserting multiple special characters with one modal is
			// a different user story.
			$scope.selectedCharacters = [character];
		}

		function selectLabel(label) {
			selectedLabel = label;

			if (label) {
				labelCharacters = getCharactersByLabel(selectedLabel).map(characterHtmlSafe);
			}
			else {
				labelCharacters = smuflCharacters.map(characterHtmlSafe);
			}

			updateFilteredLabelsAndCharacters($scope.search.filter);
		}

		function labelIsSelected(label) {
			return selectedLabel === label;
		}

		function updateFilteredLabelsAndCharacters(filter) {
			if (!filter) {
				$scope.displayedCharacters = labelCharacters;
			}
			else {
				$scope.displayedCharacters = labelCharacters.filter(function (character) {
					return character.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
				});
			}

			var labelCount = {};

			// @TODO: May be improved by using reduce()
			smuflCharacters.forEach(function (character) {
				if (filter && character.name.toLowerCase().indexOf(filter.toLowerCase()) < 0) {
					return;
				}
				character.labels.forEach(function (labelName) {
					labelCount[labelName] = (labelCount[labelName] || 0) + 1;
				});
			});

			$scope.displayedLabels = labels.map(function (label) {
				label.matches = labelCount[label.name] || 0;
				return label;
			});
		}

		$scope.$watch('search.filter', function (newSearchFilter, oldSearchFilter) {
			if (newSearchFilter === oldSearchFilter) {
				return;
			}
			if (!oldSearchFilter) {
				selectLabel();
			}
			if (!newSearchFilter && !selectedLabel) {
				selectLabel(labels[0]);
			}
			updateFilteredLabelsAndCharacters(newSearchFilter);
		});

		function apply() {
			$scope.$close({
				text: charactersToString($scope.selectedCharacters)
			});
		}

		function cancel() {
			$scope.$dismiss('cancel');
		}

		selectLabel(labels[0]);
	};
});
