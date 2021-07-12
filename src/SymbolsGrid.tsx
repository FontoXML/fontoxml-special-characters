import { Block, SpinnerIcon, StateMessage } from 'fds/components';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import t from 'fontoxml-localization/src/t';
import onlyResolveLastPromise from 'fontoxml-utils/src/onlyResolveLastPromise';

import specialCharactersManager from './specialCharactersManager';
import BaseSymbolsGrid from './ui/BaseSymbolsGrid';

type Props = {
	characterSet: string;
	columns?: number;
	onItemClick?(...args: unknown[]): unknown;
	primaryFontFamily?: string;
};

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
function SymbolsGrid({
	characterSet,
	columns,
	onItemClick,
	primaryFontFamily,
}: Props) {
	const isMounted = useRef(false);

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [characters, setCharacters] = useState(null);

	// Create a special version of the specialCharactersManager.getCharacterSet() function that
	// only returns the result of the last time it was invoked.
	// If the useEffect() hook below fires multiple times while earlier getCharacterSet() requests
	// are in flight, their results are automatically ignored:
	// only the last promise is resolved.
	const getCharacterSet = useMemo(
		() =>
			onlyResolveLastPromise(async (characterSetName) => {
				return specialCharactersManager.getCharacterSet(
					characterSetName
				);
			}),
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
			.then((characters) => {
				if (!isMounted.current) {
					return;
				}

				if (!Array.isArray(characters)) {
					return;
				}

				setCharacters(
					characters.map((character, index) => ({
						id: index,
						...character,
					})) || []
				);
				setIsLoading(false);
			})
			.catch((err) => {
				if (!isMounted.current) {
					return;
				}

				setError(err);
				setIsLoading(false);
				console.error(err);
			});
	}, [characterSet, getCharacterSet]);

	// Each StateMessage is wrapped in the same (similar) layout container as rendered by the Grid.
	if (isLoading) {
		return (
			<Block flex="1" applyCss={{ maxHeight: '100%' }}>
				<StateMessage
					title={t('Loading symbols…')}
					visual={<SpinnerIcon />}
				/>
			</Block>
		);
	}

	if (error) {
		return (
			<Block flex="1" applyCss={{ maxHeight: '100%' }}>
				<StateMessage
					title={t('Could not retrieve symbols')}
					message={t(
						'Please contact your support team or try again later.'
					)}
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
		<BaseSymbolsGrid
			characters={characters}
			columns={columns}
			onItemClick={onItemClick}
			primaryFontFamily={primaryFontFamily}
		/>
	);
}

SymbolsGrid.defaultProps = {
	columns: 8,
	onItemClick: (_event) => {},
};

export default SymbolsGrid;
