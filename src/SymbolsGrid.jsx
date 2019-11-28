import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { Flex, Grid, GridItem, UnicodeSymbol } from 'fds/components';
import { useHasChanged } from 'fds/system';

import FxOperation from 'fontoxml-fx/src/FxOperation.jsx';

import specialCharactersManager from './specialCharactersManager.js';

const defaultOperationData = { text: ' ' };

/**
 * Renders a grid of buttons for each of the characters in the specified character set.
 *
 * @fontosdk
 * @category add-on/fontoxml-special-characters
 */
function SymbolsGrid({ characterSet, columns, onItemClick }) {
	const [characters, setCharacters] = useState(
		specialCharactersManager
			.getCharacterSet(characterSet)
			.map((character, index) => ({ id: index, ...character })) || []
	);

	const characterSetHasChanged = useHasChanged(characterSet);

	useEffect(() => {
		if (characterSetHasChanged) {
			setCharacters(
				specialCharactersManager
					.getCharacterSet(characterSet)
					.map((character, index) => ({ id: index, ...character })) || []
			);
		}
	}, [characterSet, characterSetHasChanged]);

	return (
		<FxOperation operationData={defaultOperationData} operationName="insert-text">
			{({ operationState, executeOperation }) => (
				<Grid
					items={characters}
					itemSize="xs"
					maxColumns={columns}
					onItemClick={onItemClick}
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

SymbolsGrid.defaultProps = {
	columns: 8,
	onItemClick: _event => {}
};

SymbolsGrid.propTypes = {
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

export default SymbolsGrid;
