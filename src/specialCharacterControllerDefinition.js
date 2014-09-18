define([
	'editor'
], function (editor) {
	'use strict';

	function codePointToString(codePoint) {
		return String.fromCodePoint(parseInt(codePoint.substr(2), 16));
	}

	function characterToString(character) {
		return character.codePoints.map(codePointToString).join();
	}

	function charactersToString(characters) {
		return characters.map(characterToString).join();
	}

	function getCharactersByLabel(characters, label) {
		return characters.filter(function (character) {
			return character.labels.indexOf(label.name) >= 0;
		});
	}

	function preprocessLabels(characters) {
		var labelsByName = {};

		characters.forEach(function (character) {
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

	return /* @ngInject */ function SpecialCharacterController($scope, $sce, operationData) {
		var selectedLabel = null;
		var labelCharacters = null;
		var characters = editor.getCharacterSetByName(operationData.characterSet);
		var labels = preprocessLabels(characters);

		$scope.displayedCharacters = [];
		$scope.displayedLabels = [];

		$scope.selectedCharacters = [];

		$scope.contexts = [
			{
				attribute: 'name',
				sortLabel: 'Sort by label name',
				renderCharacterSubtitle: function (character) {
					return character.labels.join(', ');
				}
			},
			{
				attribute: 'characterRangeStart',
				sortLabel: 'Sort by character range',
				renderLabelSubtitle: function (label) {
					return label.characterRangeStart + ' - ' + label.characterRangeEnd;
				},
				renderCharacterSubtitle: function (character) {
					return 'Character number ' + character.codePoints.map(function (codePoint) {
						return parseInt(codePoint.substr(2), 16);
					}).join(', ');
				}
			}
		];

		$scope.search = {
			filter: undefined,
			context: $scope.contexts[0]
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
			// TODO: Push onto array selectedCharacters instead of overwrite because inserting multiple special
			// characters with one modal is a different user story.
			$scope.selectedCharacters = [character];
		}

		function selectLabel(label) {
			selectedLabel = label;

			if (label) {
				labelCharacters = getCharactersByLabel(characters, selectedLabel).map(characterHtmlSafe);
			}
			else {
				labelCharacters = characters.map(characterHtmlSafe);
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

			var matchedCharactersPerLabel = characters.reduce(function (charactersPerLabel, character) {
				if (filter && character.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
					character.labels.forEach(function (labelName) {
						charactersPerLabel[labelName] = (charactersPerLabel[labelName] || 0) + 1;
					});
				}

				return charactersPerLabel;
			}, {});

			$scope.displayedLabels = labels.map(function (label) {
				label.matches = matchedCharactersPerLabel[label.name] || 0;
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
			else {
				if (!newSearchFilter && !selectedLabel) {
					selectLabel(labels[0]);
				}
			}

			updateFilteredLabelsAndCharacters(newSearchFilter);
		});

		function apply() {
			operationData.text = charactersToString($scope.selectedCharacters);

			$scope.$close(operationData);
		}

		function cancel() {
			$scope.$dismiss();
		}

		selectLabel(labels[0]);
	};
});
