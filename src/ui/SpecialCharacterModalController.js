define([
	'fontoxml-local-storage',

	'../specialCharactersManager',
	'../api/characterToString'
], function (
	localStorage,

	specialCharactersManager,
	characterToString
	) {
	'use strict';

	var localStorageService = localStorage.localStorageService;

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
						characterRangeStartFrom: null,
						characterRangeEnd: null,
						characterRangeEndFrom: null
					};
				}

				var labelInfo = labelsByName[labelName];
				labelInfo.count += 1;

				character.codePoints.forEach(function (codePoint) {
					var weight = parseInt(codePoint.substr(2), 16);
					if (labelInfo.characterRangeStart === null || weight < labelInfo.characterRangeStart) {
						labelInfo.characterRangeStart = weight;
						labelInfo.characterRangeStartFrom = character;
					}
					if (labelInfo.characterRangeEnd === null || weight > labelInfo.characterRangeEnd) {
						labelInfo.characterRangeEnd = weight;
						labelInfo.characterRangeEndFrom = character;
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

	return /* @ngInject */ function SpecialCharacterModalController ($scope, $location, operationData) {
		var labelCharacters = null;
		var characters = specialCharactersManager.getCharacterSet(operationData.characterSet);
		var labels = preprocessLabels(characters);

		var applicationPrefix = $location.host() + ':' + $location.port();
		var storagePrefix = applicationPrefix + '|fontoxml-ui-special-characters|' + operationData.characterSet + '|';

		$scope.displayedCharacters = [];
		$scope.displayedRecentCharacters = [];
		$scope.displayedLabels = [];

		$scope.filterEmptyCharacters = function (character) {
			return character && character.name;
		};

		$scope.contexts = [
			{
				attribute: 'characterRangeStart',
				sortLabel: 'default',
				renderLabelSubtitle: function (label) {
					return label.characterRangeStartFrom.codePoints.join(', ') + ' – ' +
						label.characterRangeEndFrom.codePoints.join(', ');
				},
				renderCharacterSubtitle: function (character) {
					return character.codePoints.join(', ');
				}
			},
			{
				attribute: 'name',
				sortLabel: 'name',
				renderCharacterSubtitle: function (character) {
					return character.labels.join(', ');
				}
			}
		];

		var storedSearchContextAttribute = $scope.contexts[0].attribute,
			storedSelectedLabel = labels[0],
			storedSearchFilter = '',
			storedSelectedCharacters = [],
			storedDisplayedRecentCharacters = [];

		if (localStorageService.hasData(storagePrefix + 'storedSearchContextAttribute')) {
			storedSearchContextAttribute = localStorageService.getData(storagePrefix + 'storedSearchContextAttribute');
		}
		if (localStorageService.hasData(storagePrefix + 'storedSelectedLabel')) {
			try {
				storedSelectedLabel = localStorageService.getData(storagePrefix + 'storedSelectedLabel');
				storedSelectedLabel = storedSelectedLabel !== 'undefined' ? JSON.parse(storedSelectedLabel) : undefined;
			}
			catch (error) {
				console.error('Error during JSON parsing of localStorageService.getData(' + storagePrefix + 'storedSelectedLabel")');
			}
		}
		if (localStorageService.hasData(storagePrefix + 'storedSearchFilter')) {
			storedSearchFilter = localStorageService.getData(storagePrefix + 'storedSearchFilter');
		}
		if (localStorageService.hasData(storagePrefix + 'storedSelectedCharacters')) {
			try {
				storedSelectedCharacters = JSON.parse(localStorageService.getData(storagePrefix + 'storedSelectedCharacters'));
			}
			catch (error) {
				console.error('Error during JSON parsing of localStorageService.getData(' + storagePrefix + 'storedSelectedCharacters")');
			}
		}
		if (localStorageService.hasData(storagePrefix + 'storedDisplayedRecentCharacters')) {
			try {
				storedDisplayedRecentCharacters = JSON.parse(localStorageService.getData(storagePrefix + 'storedDisplayedRecentCharacters'));
			}
			catch (error) {
				console.error('Error during JSON parsing of localStorageService.getData(' + storagePrefix + 'storedDisplayedRecentCharacters")');
			}
		}

		var selectedLabel = storedSelectedLabel;

		$scope.search = {
			context: $scope.contexts.find(function (context) {
				return context.attribute === storedSearchContextAttribute;
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

		$scope.apply = function apply () {
			localStorageService.setData(storagePrefix + 'storedSearchContextAttribute', $scope.search.context.attribute);
			localStorageService.setData(storagePrefix + 'storedSelectedLabel', JSON.stringify(selectedLabel));
			localStorageService.setData(storagePrefix + 'storedSearchFilter', $scope.search.filter);
			localStorageService.setData(storagePrefix + 'storedSelectedCharacters', JSON.stringify($scope.selectedCharacters));

			$scope.selectedCharacters.forEach(function (selectedCharacter) {
				var isInRecentCharacters = $scope.displayedRecentCharacters.some(function (recentCharacter) {
					return recentCharacter.id === selectedCharacter.id;
				});
				if (!isInRecentCharacters) {
					$scope.displayedRecentCharacters.unshift(selectedCharacter);
					if ($scope.displayedRecentCharacters.length > 8) {
						$scope.displayedRecentCharacters = $scope.displayedRecentCharacters.slice(0, 8);
					}
				}
			});

			localStorageService.setData(storagePrefix + 'storedDisplayedRecentCharacters', JSON.stringify($scope.displayedRecentCharacters));

			operationData.text = $scope.selectedCharacters.map(characterToString).join();

			$scope.$close(operationData);
		};

		$scope.cancel = function cancel () {
			$scope.$dismiss();
		};


		function characterHtmlSafe (character) {
			if (!character.html) {
				// &#8202; is prepended to this html in the jade template file; avoids the Chromium-specific bug that
				// obstructs rendering zero-width characters:
				// https://code.google.com/p/chromium/issues/detail?id=281402
				character.html = characterToString(character);
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
			$scope.selectedCharacters = [character];
		}

		function labelIsSelected (label) {
			if (label === undefined && selectedLabel === undefined) {
				return true;
			}
			else if (label === undefined || selectedLabel === undefined) {
				return false;
			}

			return selectedLabel.name === label.name;
		}

		function characterIsSelected (character) {
			if (character === undefined && $scope.selectedCharacters.length === 0) {
				return true;
			}
			else if (character === undefined || $scope.selectedCharacters.length === 0) {
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
				//$scope.displayedCharacters = labelCharacters.map(function (character) {
				//	character.hidden = character.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
				//	return character;
				//});
				$scope.displayedCharacters = labelCharacters.filter(function (character) {
					return character.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
				});
				// Limit to 100 results
				$scope.displayedCharacters = $scope.displayedCharacters.slice(0, 100);
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
			else if (!newSearchFilter && !selectedLabel) {
				selectLabel(labels[0]);
			}

			updateFilteredLabelsAndCharacters(newSearchFilter);
		});
	};
});
