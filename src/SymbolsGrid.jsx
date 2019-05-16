import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Flex, Grid, GridItem, UnicodeSymbol } from 'fds/components';

import FxOperation from 'fontoxml-fx/src/FxOperation.jsx';

import specialCharactersManager from './specialCharactersManager.js';

/**
 * Renders a grid of buttons for each of the characters in the specified character set.
 *
 * @fontosdk
 * @category add-on/fontoxml-special-characters
 */
class SymbolsGrid extends Component {
	static defaultProps = {
		columns: 8,
		onItemClick: _event => {}
	};

	static propTypes = {
		/**
		 * The name of the character set to display, as used in {@link SpecialCharactersManager#addCharacterSet}.
		 */
		characterSet: PropTypes.string.isRequired,

		/**
		 * The number of columns to use in the grid.
		 */
		columns: PropTypes.number,

		/**
		 * Function to be called when an item in the grid is clicked.
		 *
		 * This can be used, for example, to close the {@link Drop} containing the grid when a character is inserted.
		 *
		 * @type {FX~OnItemClickCallback}
		 */
		onItemClick: PropTypes.func
	};

	state = {
		characters:
			specialCharactersManager
				.getCharacterSet(this.props.characterSet)
				.map((character, index) => ({ id: index, ...character })) || []
	};

	componentWillReceiveProps(nextProps) {
		if (nextProps.characterSet !== this.props.characterSet) {
			this.setState({
				characters:
					specialCharactersManager
						.getCharacterSet(nextProps.characterSet)
						.map((character, index) => ({ id: index, ...character })) || []
			});
		}
	}

	render() {
		return (
			<FxOperation operationData={{ text: ' ' }} operationName="insert-text">
				{({ operationState, executeOperation }) => (
					<Grid
						items={this.state.characters}
						itemSize="xs"
						maxColumns={this.props.columns}
						onItemClick={this.props.onItemClick}
						paddingSize="s"
						renderItem={({ item, itemSize, key, onClick }) => {
							const text = item.codePoints
								.map(codePoint =>
									String.fromCodePoint(parseInt(codePoint.substr(2), 16))
								)
								.join('');

							return (
								<GridItem
									key={key}
									cursor="pointer"
									isDisabled={!operationState.enabled}
									onClick={event => {
										executeOperation({ text });
										onClick(event);
									}}
									tooltipContent={item.name}
									size={itemSize}
									type="unicode-symbol"
								>
									<Flex
										alignItems="center"
										applyCss={{ height: '0.875rem' }}
										justifyContent="center"
										spaceSize="s"
									>
										{item.codePoints.map((codePoint, index) => (
											<UnicodeSymbol code={codePoint} key={index} size="s" />
										))}
									</Flex>
								</GridItem>
							);
						}}
						spaceSize="s"
					/>
				)}
			</FxOperation>
		);
	}
}

export default SymbolsGrid;
