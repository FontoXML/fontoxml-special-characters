define([
	'editor',

	'fontoxml-local-storage'
], function (
	editor,

	localStorage) {
	'use strict';

	var localStorageService = localStorage.localStorageService;

	function codePointToString (codePoint) {
		return String.fromCodePoint(parseInt(codePoint.substr(2), 16));
	}

	function characterToString (character) {
		return character.codePoints.map(codePointToString).join();
	}

	function charactersToString (characters) {
		return characters.map(characterToString).join();
	}

	function getCharactersByLabel (characters, label) {
		return characters.filter(function (character) {
			return character.labels.indexOf(label.name) >= 0;
		});
	}

	function preprocessLabels (characters) {
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

	return /* @ngInject */ function SpecialCharacterController ($scope, operationData) {
		var labelCharacters = null;
		var characters = editor.getCharacterSetByName(operationData.characterSet);
		var labels = preprocessLabels(characters);

		$scope.displayedCharacters = [];
		$scope.displayedRecentCharacters = [];
		$scope.displayedLabels = [];

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

		var storedSearchContextAttribute = $scope.contexts[0].attribute,
			storedSelectedLabel = labels[0],
			storedSearchFilter = '',
			storedSelectedCharacters = [],
			storedDisplayedRecentCharacters = [];

		if (localStorageService.hasData('fontoxml-ui-special-characters|storedSearchContextAttribute')) {
			storedSearchContextAttribute = localStorageService.getData('fontoxml-ui-special-characters|storedSearchContextAttribute');
		}
		if (localStorageService.hasData('fontoxml-ui-special-characters|storedSelectedLabel')) {
			try {
				var storedSelectedLabel = localStorageService.getData('fontoxml-ui-special-characters|storedSelectedLabel');
				storedSelectedLabel = storedSelectedLabel != 'undefined' ? JSON.parse(storedSelectedLabel) : undefined;
			} catch (error) {
				console.error('Error during JSON parsing of localStorageService.getData("fontoxml-ui-special-characters|storedSelectedLabel")');
			}
		}
		if (localStorageService.hasData('fontoxml-ui-special-characters|storedSearchFilter')) {
			storedSearchFilter = localStorageService.getData('fontoxml-ui-special-characters|storedSearchFilter');
		}
		if (localStorageService.hasData('fontoxml-ui-special-characters|storedSelectedCharacters')) {
			try {
				storedSelectedCharacters = JSON.parse(localStorageService.getData('fontoxml-ui-special-characters|storedSelectedCharacters'));
			} catch (error) {
				console.error('Error during JSON parsing of localStorageService.getData("fontoxml-ui-special-characters|storedSelectedCharacters")');
			}
		}
		if (localStorageService.hasData('fontoxml-ui-special-characters|storedDisplayedRecentCharacters')) {
			try {
				storedDisplayedRecentCharacters = JSON.parse(localStorageService.getData('fontoxml-ui-special-characters|storedDisplayedRecentCharacters'));
			} catch (error) {
				console.error('Error during JSON parsing of localStorageService.getData("fontoxml-ui-special-characters|storedDisplayedRecentCharacters")');
			}
		}

		var selectedLabel = storedSelectedLabel;

		$scope.search = {
			context: $scope.contexts.find(function (context) {
				return context.attribute === storedSearchContextAttribute
			}),
			filter: storedSearchFilter
		};
		$scope.selectedCharacters = storedSelectedCharacters;
		$scope.displayedRecentCharacters = storedDisplayedRecentCharacters;

		selectLabel(selectedLabel);

		$scope.selectLabel = selectLabel;
		$scope.characterIsSelected = characterIsSelected;
		$scope.labelIsSelected = labelIsSelected;
		$scope.selectCharacter = selectCharacter;

		$scope.apply = apply;
		$scope.cancel = cancel;


		function characterHtmlSafe (character) {
			if (!character.html) {
				// &#8202; is added to avoid the Chromium-specific bug that obstructs rendering zero-width characters:
				// https://code.google.com/p/chromium/issues/detail?id=281402
				character.html = '&#8202;' + characterToString(character);
			}

			return character;
		}

		function selectLabel (label) {
			selectedLabel = label;

			if (label) {
				labelCharacters = getCharactersByLabel(characters, selectedLabel).map(characterHtmlSafe);
			}
			else {
				labelCharacters = characters.map(characterHtmlSafe);
			}

			updateFilteredLabelsAndCharacters($scope.search.filter);
		}

		function selectCharacter (character) {
			// TODO: Push onto array selectedCharacters instead of overwrite because inserting multiple special
			// characters with one modal is a different user story.
			$scope.selectedCharacters = [character];
		}

		function labelIsSelected (label) {
			if (label === undefined && selectedLabel === undefined) {
				return true;
			} else if (label === undefined || selectedLabel === undefined) {
				return false;
			}

			return selectedLabel.name === label.name;
		}

		function characterIsSelected (character) {
			if (character === undefined && $scope.selectedCharacters.length === 0) {
				return true;
			} else if (character === undefined || $scope.selectedCharacters.length === 0) {
				return false;
			}

			return $scope.selectedCharacters.find(function (selectedCharacter) {
				return character.id === selectedCharacter.id;
			});
		}

		function updateFilteredLabelsAndCharacters (filter) {
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
			localStorageService.setData('fontoxml-ui-special-characters|storedSearchContextAttribute', $scope.search.context.attribute);
			localStorageService.setData('fontoxml-ui-special-characters|storedSelectedLabel', JSON.stringify(selectedLabel));
			localStorageService.setData('fontoxml-ui-special-characters|storedSearchFilter', $scope.search.filter);
			localStorageService.setData('fontoxml-ui-special-characters|storedSelectedCharacters', JSON.stringify($scope.selectedCharacters));

			$scope.selectedCharacters.forEach(function (selectedCharacter) {
				var isInRecentCharacters = $scope.displayedRecentCharacters.some(function (recentCharacter) {
					return recentCharacter.id === selectCharacter.id;
				});
				if (!isInRecentCharacters) {
					$scope.displayedRecentCharacters.unshift(selectedCharacter);
					if ($scope.displayedRecentCharacters.length > 8) {
						$scope.displayedRecentCharacters = $scope.displayedRecentCharacters.slice(0, 8);
					}
				}
			});

			localStorageService.setData('fontoxml-ui-special-characters|storedDisplayedRecentCharacters', JSON.stringify($scope.displayedRecentCharacters));

			operationData.text = charactersToString($scope.selectedCharacters);

			$scope.$close(operationData);
		}

		function cancel() {
			$scope.$dismiss();
		}
	};
});
