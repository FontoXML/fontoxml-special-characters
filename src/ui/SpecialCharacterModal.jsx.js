import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import characterToString from '../api/characterToString';
import FxSymbolOptions from './symbol-options/FxSymbolOptions.jsx';
import FxSymbolPreview from './FxSymbolPreview.jsx';
import FxSymbols from './FxSymbols.jsx';
import specialCharactersManager from '../specialCharactersManager';

import {
	Block,
	Button,
	Flex,
	Label,
	Modal,
	ModalBody,
	ModalBodyToolbar,
	ModalContent,
	ModalFooter,
	ModalHeader,
	SearchInput,
	StateMessage,
	TabButtons,
	TabButton
} from 'fontoxml-vendor-fds/components';

const filterSymbolOptionsClearButtonLabel = t('Clear');
const filterSymbolOptionsHeadingLabel = t('Filter by subset');
const noSearchResultsStateMessageTitle = t('No symbols found');
const noRecentResultsStateMessageTitle = t('Nothing here yet…');

// TODO: rewrite to modern code
function createFilterOptionsFromSymbols(symbols) {
	const labelsByName = {};

	symbols.forEach(character => {
		character.labels.forEach(labelName => {
			if (!labelsByName[labelName]) {
				labelsByName[labelName] = {
					label: labelName,
					count: 0,
					characterRangeStart: null
				};
			}

			const labelInfo = labelsByName[labelName];
			labelInfo.count += 1;

			character.codePoints.forEach(codePoint => {
				const weight = parseInt(codePoint.substr(2), 16);
				if (
					labelInfo.characterRangeStart === null ||
					weight < labelInfo.characterRangeStart
				) {
					labelInfo.characterRangeStart = weight;
				}
			});
		});
	});

	return Object.keys(labelsByName).map(labelName => labelsByName[labelName]).sort((a, b) => {
		if (a.characterRangeStart === b.characterRangeStart) {
			return 0;
		}
		return a.characterRangeStart < b.characterRangeStart ? -1 : 1;
	});
}

const messages = {
	modalTitle: t('Insert symbol'),
	cancelButtonLabel: t('Cancel'),
	submitButtonLabel: t('Insert'),
	noResultsLabel: t('(no results)'),
	resultsCounterLabel: counter => t('({COUNTER} results)', { COUNTER: counter })
};

const searchInputContainerStyles = { maxWidth: '20rem', width: '100%' };
const searchInputPlaceholder = t('Search by name or codepoint');

class SpecialCharacterModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			characterSet: PropTypes.string.isRequired,
			modalIcon: PropTypes.string.isRequired
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	storagePrefix = window.location.host +
		'|fontoxml-special-symbols|' +
		this.props.data.characterSet +
		'|';

	allSymbols = specialCharactersManager
		.getCharacterSet(this.props.data.characterSet)
		.map(symbol => ({
			...symbol,
			value: symbol.id
		}));
	filterOptionsForAllSymbols = createFilterOptionsFromSymbols(this.allSymbols);

	recentSymbols = [];
	filterOptionsForRecentSymbols = [];

	state = {
		activeTab: 'all',
		searchInputValue: '',
		selectedFilterOption: null,
		selectedSymbols: []
	};

	componentDidMount() {
		const data = window.localStorage.getItem(this.storagePrefix + 'storedRecentCharacters');
		if (data) {
			try {
				this.recentSymbols = JSON.parse(data);
				this.filterOptionsForRecentSymbols = createFilterOptionsFromSymbols(
					this.recentSymbols
				);

				if (this.recentSymbols.length > 0) {
					this.setState({ activeTab: 'recent' });
				}
			} catch (error) {
				console.error(`Can not parse recent characters, got "${data}"`, error);
			}
		}
	}

	filterSymbolsForSelectedFilterOption(symbols) {
		const { selectedFilterOption } = this.state;
		if (!selectedFilterOption) {
			return symbols;
		}

		return symbols.filter(symbol =>
			symbol.labels.includes(this.state.selectedFilterOption.label)
		);
	}

	determineDisplayedSymbols() {
		const { activeTab, searchInputValue } = this.state;

		if (activeTab === 'all') {
			return this.filterSymbolsForSelectedFilterOption(this.allSymbols);
		} else if (activeTab === 'recent') {
			return this.filterSymbolsForSelectedFilterOption(this.recentSymbols);
		}

		// search
		return this.allSymbols.filter(
			symbol =>
				// match on the name
				symbol.name.toLowerCase().includes(searchInputValue.toLowerCase()) ||
				// match on one of the labels
				symbol.labels.some(label =>
					label.toLowerCase().includes(searchInputValue.toLowerCase())
				) ||
				// or match on one of the code points
				symbol.codePoints.some(codePoint =>
					codePoint.toLowerCase().includes(searchInputValue.toLowerCase())
				)
		);
	}

	determineFilteredDisplayedSymbols(displayedSymbols) {
		const { selectedFilterOption } = this.state;

		if (!selectedFilterOption) {
			return displayedSymbols;
		}

		return displayedSymbols.filter(symbol =>
			symbol.labels.includes(selectedFilterOption.label)
		);
	}

	determineFilterOptions(displayedSymbols) {
		const { activeTab } = this.state;

		if (activeTab === 'all') {
			return this.filterOptionsForAllSymbols;
		} else if (activeTab === 'recent') {
			return this.filterOptionsForRecentSymbols;
		}

		// displayedSymbols === symbols matching the searchInputValue, @see determineDisplayedSymbols()
		const displayedSymbolsLabels = displayedSymbols.reduce((labels, symbol) => {
			symbol.labels.forEach(label => {
				if (!labels.includes(label)) {
					labels.push(label);
				}
			});

			return labels;
		}, []);

		return this.filterOptionsForAllSymbols.filter(filterOption =>
			displayedSymbolsLabels.includes(filterOption.label)
		);
	}

	handleAllTabButtonClick = () => {
		this.setState({
			activeTab: 'all',
			searchInputValue: '',
			selectedFilterOption: null
		});
	};

	handleRecentTabButtonClick = () => {
		this.setState({
			activeTab: 'recent',
			searchInputValue: '',
			selectedFilterOption: null
		});
	};

	// TODO: focus SearchInput when possible in FDS with focus behavior.
	handleSearchTabButtonClick = () => this.setState({ activeTab: 'search' });

	handleSearchInputChange = searchInputValue => {
		this.setState({
			activeTab: searchInputValue !== '' ? 'search' : 'all',
			searchInputValue,
			selectedFilterOption: null
		});
	};

	handleFilterClearClick = () => this.setState({ selectedFilterOption: null });
	handleFilterOptionClick = selectedFilterOption => this.setState({ selectedFilterOption });

	renderResultsCounter(symbolsLength, searchInputValue) {
		if (searchInputValue) {
			return (
				<Label align="center" colorName="text-muted-color">
					{symbolsLength} results for “{searchInputValue}”
				</Label>
			);
		}

		return (
			<Label align="center" colorName="text-muted-color">
				{symbolsLength} symbols
			</Label>
		);
	}

	handleSymbolClick = selectedSymbol => this.setState({ selectedSymbols: [selectedSymbol] });
	handleSymbolDoubleClick = selectedSymbol => {
		this.setState({ selectedSymbols: [selectedSymbol] }, this.handleSubmitButtonClick);
	};

	determineEmptyStateMessage() {
		if (this.state.activeTab === 'recent') {
			return t(
				'We can’t find any recently used symbols. ' +
					'Click on the “All” tab or search for a symbol.'
			);
		}

		return t(
			'We can’t find any symbols with “{SEARCH_INPUT_VALUE}” in their name or codepoint. ' +
				'Please try something else.',
			{ SEARCH_INPUT_VALUE: this.state.searchInputValue }
		);
	}

	handleSubmitButtonClick = () => {
		const selectedSymbol = this.state.selectedSymbols[0];

		const indexInRecentSymbols = this.recentSymbols.findIndex(
			recentSymbol => recentSymbol.id === selectedSymbol.id
		);
		if (indexInRecentSymbols !== -1) {
			this.recentSymbols.splice(indexInRecentSymbols, 1);
		}
		this.recentSymbols.unshift(selectedSymbol);
		this.recentSymbols = this.recentSymbols.slice(0, 50);

		window.localStorage.setItem(
			this.storagePrefix + 'storedRecentCharacters',
			JSON.stringify(this.recentSymbols)
		);

		this.props.submitModal({ text: characterToString(selectedSymbol) });
	};

	render() {
		const { activeTab, searchInputValue, selectedFilterOption, selectedSymbols } = this.state;

		const displayedSymbols = this.determineDisplayedSymbols();
		const filteredDisplayedSymbols = this.determineFilteredDisplayedSymbols(displayedSymbols);
		const filterOptions = this.determineFilterOptions(displayedSymbols);

		return (
			<Modal isFullHeight size="m">
				<ModalHeader icon={this.props.data.modalIcon} title={messages.modalTitle} />

				<ModalBody paddingSize="l" spaceSize="l">
					<ModalBodyToolbar justifyContent="space-between">
						<TabButtons>
							<TabButton
								isActive={activeTab === 'all'}
								label="All symbols"
								onClick={this.handleAllTabButtonClick}
							/>

							<TabButton
								isActive={activeTab === 'recent'}
								label="Recently used"
								onClick={this.handleRecentTabButtonClick}
							/>

							{activeTab === 'search' &&
								<TabButton
									isActive={true}
									label="Search"
									onClick={this.handleSearchTabButtonClick}
								/>}
						</TabButtons>

						<Block applyCss={searchInputContainerStyles}>
							<SearchInput
								onChange={this.handleSearchInputChange}
								placeholder={searchInputPlaceholder}
								value={searchInputValue}
							/>
						</Block>
					</ModalBodyToolbar>

					{filteredDisplayedSymbols.length > 0 &&
						<ModalContent>
							<ModalContent flex="0 0 240px" flexDirection="column" spaceSize="l">
								<FxSymbolOptions
									clearButtonLabel={filterSymbolOptionsClearButtonLabel}
									flex="1"
									headingLabel={filterSymbolOptionsHeadingLabel}
									onClearClick={this.handleFilterClearClick}
									onOptionClick={this.handleFilterOptionClick}
									options={filterOptions}
									selectedOption={selectedFilterOption}
								/>
							</ModalContent>

							<ModalContent flex="1" flexDirection="column">
								<Flex justifyContent="center" paddingSize="m">
									{this.renderResultsCounter(
										displayedSymbols.length,
										searchInputValue
									)}
								</Flex>

								<FxSymbols
									onSymbolClick={this.handleSymbolClick}
									onSymbolDoubleClick={this.handleSymbolDoubleClick}
									selectedSymbols={selectedSymbols}
									symbols={filteredDisplayedSymbols}
								/>
							</ModalContent>

							{selectedSymbols.length > 0 &&
								<ModalContent flex="0 0 240px" flexDirection="column">
									<FxSymbolPreview symbol={selectedSymbols[0]} />
								</ModalContent>}
						</ModalContent>}

					{filteredDisplayedSymbols.length === 0 &&
						<ModalContent alignItems="center" justifyContent="center">
							<StateMessage
								message={this.determineEmptyStateMessage()}
								title={
									activeTab === 'recent'
										? noRecentResultsStateMessageTitle
										: noSearchResultsStateMessageTitle
								}
								visual="meh-o"
							/>
						</ModalContent>}
				</ModalBody>

				<ModalFooter>
					<Button label={messages.cancelButtonLabel} onClick={this.props.cancelModal} />

					<Button
						isDisabled={selectedSymbols.length === 0}
						label={messages.submitButtonLabel}
						onClick={this.handleSubmitButtonClick}
						type="primary"
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default SpecialCharacterModal;
