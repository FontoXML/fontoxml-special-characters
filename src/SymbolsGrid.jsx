import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState, useRef } from 'react';

import {
	Flex,
	Grid,
	GridItem,
	SpinnerIcon,
	StateMessage,
	UnicodeSymbol,
	Block
} from 'fds/components';

import useOperation from 'fontoxml-fx/src/useOperation.js';
import t from 'fontoxml-localization/src/t.js';
import onlyResolveLastPromise from 'fontoxml-utils/src/onlyResolveLastPromise.js';

import specialCharactersManager from './specialCharactersManager.js';

const defaultOperationData = { text: ' ' };

/**
 * Renders a grid of buttons for each of the characters in the specified character set.
 * The character set is loaded lazily but cached centrally during the lifetime of the browser
 * window.
 *
 * If the characterSet is loading, a loading state message is shown.
 * If the characterSet has no symbols, an empty state message is shown.
 * If there is an error during loading/parsing of the characterSet, an error state message is
 * shown and more details on the error are logged to the console.
 *
 * @fontosdk
 * @react
 * @category add-on/fontoxml-special-characters
 */
function SymbolsGrid({ characterSet, columns, onItemClick }) {
	const isMounted = useRef(false);

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [characters, setCharacters] = useState(null);
	const { executeOperation, operationState } = useOperation('insert-text', defaultOperationData);

	// Create a special version of the specialCharactersManager.getCharacterSet() function that
	// only returns the result of the last time it was invoked.
	// If the useEffect() hook below fires multiple times while earlier getCharacterSet() requests
	// are in flight, their results are automatically ignored:
	// only the last promise is resolved.
	const getCharacterSet = useMemo(
		() =>
			onlyResolveLastPromise(characterSet =>
				specialCharactersManager.getCharacterSet(characterSet)
			),
		[]
	);

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
		};
	}, []);

	// This effect is fired after mount and whenever characterSet changes.
	useEffect(() => {
		if (!isMounted.current) {
			return;
		}

		setError(null);
		setIsLoading(true);

		getCharacterSet(characterSet)
			.then(characters => {
				if (!isMounted.current) {
					return;
				}

				if (!Array.isArray(characters)) {
					return;
				}

				setCharacters(
					characters.map((character, index) => ({ id: index, ...character })) || []
				);
				setIsLoading(false);
			})
			.catch(error => {
				if (!isMounted.current) {
					return;
				}

				setError(error);
				setIsLoading(false);
				console.error(error);
			});
	}, [characterSet, getCharacterSet]);

	// Each StateMessage is wrapped in the same (similar) layout container as rendered by the Grid.
	if (isLoading) {
		return (
			<Block flex="1" applyCss={{ maxHeight: '100%' }}>
				<StateMessage title={t('Loading symbols…')} visual={<SpinnerIcon />} />
			</Block>
		);
	}

	if (error) {
		return (
			<Block flex="1" applyCss={{ maxHeight: '100%' }}>
				<StateMessage
					title={t('Could not retrieve symbols')}
					message={t('Please contact your support team or try again later.')}
					connotation="error"
					visual="times"
				/>
			</Block>
		);
	}

	// This should not happen, why would you configure an empty character set to render?
	// But maybe someone does something clever with some sort of dynamically populated json for
	// the character set somehow, so show a nice StateMessage to the user anyway, otherwise they'd
	// see nothing at all in this case.
	if (characters.length === 0) {
		return (
			<Block flex="1" applyCss={{ maxHeight: '100%' }}>
				<StateMessage title={t('No symbols found')} visual="meh-o" />
			</Block>
		);
	}

	return (
		<Grid
			items={characters}
			itemSize="xs"
			maxColumns={columns}
			onItemClick={onItemClick}
			paddingSize="s"
			renderItem={({ item, itemSize, key, onClick }) => {
				const text = item.codePoints
					.map(codePoint => String.fromCodePoint(parseInt(codePoint.substr(2), 16)))
					.join('');

				return (
					<GridItem
						key={key}
						cursor="pointer"
						isDisabled={!operationState.enabled}
						onClick={event => {
							// This is undocumented behavior of useOperation's executeOperation().
							// It is a 'necessary evil' here.
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
