import PropTypes from 'prop-types';
import React, { Component } from 'react';

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
} from 'fds/components';
import t from 'fontoxml-localization/src/t.js';

import characterToString from '../api/characterToString.js';
import SymbolOptions from './symbol-options/SymbolOptions.jsx';
import SymbolPreview from './SymbolPreview.jsx';
import Symbols from './Symbols.jsx';
import specialCharactersManager from '../specialCharactersManager.js';

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

	return Object.keys(labelsByName)
		.map(labelName => labelsByName[labelName])
		.sort((a, b) => {
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

	searchInputRef = null;

	storagePrefix =
		window.location.host + '|fontoxml-special-symbols|' + this.props.data.characterSet + '|';

	allSymbols = specialCharactersManager.getCharacterSet(this.props.data.characterSet);
	filterOptionsForAllSymbols = createFilterOptionsFromSymbols(this.allSymbols);

	recentSymbols = [];
	filterOptionsForRecentSymbols = [];

	state = {
		activeTab: 'all',
		searchInputValue: '',
		selectedFilterOption: null,
		selectedSymbol: null
	};

	componentDidMount() {
		this.searchInputRef.focus();

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

	handleSubmitButtonClick = () => {
		const { selectedSymbol } = this.state;

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

	handleKeyDown = event => {
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (this.state.selectedSymbol !== null) {
					this.handleSubmitButtonClick();
				}
				break;
		}
	};

	handleAllTabButtonClick = () => {
		this.setState({
			activeTab: 'all',
			selectedFilterOption: null
		});
	};

	handleRecentTabButtonClick = () => {
		this.setState({
			activeTab: 'recent',
			selectedFilterOption: null
		});
	};

	handleSearchTabButtonClick = () => {
		this.searchInputRef.focus();

		this.setState({
			activeTab: 'search',
			selectedFilterOption: null
		});
	};

	handleSearchInputChange = searchInputValue => {
		this.setState({
			activeTab: searchInputValue !== '' ? 'search' : 'all',
			searchInputValue,
			selectedFilterOption: null
		});
	};
	handleSearchInputRef = searchInputRef => (this.searchInputRef = searchInputRef);

	handleFilterClearClick = () => this.setState({ selectedFilterOption: null });
	handleFilterOptionClick = selectedFilterOption => this.setState({ selectedFilterOption });

	renderResultsCounter(symbolsLength, searchInputValue, activeTab) {
		if (activeTab === 'search') {
			return (
				<Label align="center" colorName="text-muted-color">
					{t('{SYMBOLS_LENGTH} results for “{SEARCH_INPUT_VALUE}”', {
						SYMBOLS_LENGTH: symbolsLength,
						SEARCH_INPUT_VALUE: searchInputValue
					})}
				</Label>
			);
		}

		return (
			<Label align="center" colorName="text-muted-color">
				{t('{SYMBOLS_LENGTH} symbols', { SYMBOLS_LENGTH: symbolsLength })}
			</Label>
		);
	}

	handleSymbolClick = selectedSymbol => this.setState({ selectedSymbol });
	handleSymbolDoubleClick = selectedSymbol => {
		this.setState({ selectedSymbol }, this.handleSubmitButtonClick);
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

	render() {
		const { activeTab, searchInputValue, selectedFilterOption, selectedSymbol } = this.state;

		const displayedSymbols = this.determineDisplayedSymbols();
		const filteredDisplayedSymbols = this.determineFilteredDisplayedSymbols(displayedSymbols);
		const filterOptions = this.determineFilterOptions(displayedSymbols);

		return (
			<Modal isFullHeight size="m" onKeyDown={this.handleKeyDown}>
				<ModalHeader icon={this.props.data.modalIcon} title={messages.modalTitle} />

				<ModalBody paddingSize="l" spaceSize="l">
					<ModalBodyToolbar justifyContent="space-between">
						<TabButtons>
							<TabButton
								isActive={activeTab === 'all'}
								label={t('All symbols')}
								onClick={this.handleAllTabButtonClick}
							/>

							<TabButton
								isActive={activeTab === 'recent'}
								label={t('Recently used')}
								onClick={this.handleRecentTabButtonClick}
							/>

							{searchInputValue !== '' && (
								<TabButton
									isActive={activeTab === 'search'}
									label={t('Search')}
									onClick={this.handleSearchTabButtonClick}
								/>
							)}
						</TabButtons>

						<Block applyCss={searchInputContainerStyles}>
							<SearchInput
								onChange={this.handleSearchInputChange}
								placeholder={searchInputPlaceholder}
								ref={this.handleSearchInputRef}
								value={searchInputValue}
							/>
						</Block>
					</ModalBodyToolbar>

					{filteredDisplayedSymbols.length > 0 && (
						<ModalContent>
							<ModalContent flex="0 0 240px" flexDirection="column" spaceSize="l">
								<SymbolOptions
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
										filteredDisplayedSymbols.length,
										searchInputValue,
										activeTab
									)}
								</Flex>

								<Symbols
									onSymbolClick={this.handleSymbolClick}
									onSymbolDoubleClick={this.handleSymbolDoubleClick}
									selectedSymbol={selectedSymbol}
									symbols={filteredDisplayedSymbols}
								/>
							</ModalContent>

							{selectedSymbol !== null && (
								<ModalContent flex="0 0 240px" flexDirection="column">
									<SymbolPreview symbol={selectedSymbol} />
								</ModalContent>
							)}
						</ModalContent>
					)}

					{filteredDisplayedSymbols.length === 0 && (
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
						</ModalContent>
					)}
				</ModalBody>

				<ModalFooter>
					<Button label={messages.cancelButtonLabel} onClick={this.props.cancelModal} />

					<Button
						isDisabled={selectedSymbol === null}
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