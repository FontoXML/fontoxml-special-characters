import { Block, SpinnerIcon, StateMessage } from 'fds/components';
import React, { useEffect, useMemo, useState } from 'react';

import useManagerState from 'fontoxml-fx/src/useManagerState';
import t from 'fontoxml-localization/src/t';
import onlyResolveLastPromise from 'fontoxml-utils/src/onlyResolveLastPromise';

import specialCharactersManager from './specialCharactersManager';
import BaseSymbolsGrid from './ui/BaseSymbolsGrid';

type Props = {
	fallbackCharacterSet?: string;
	columns?: number;
	maxCharacters?: number;
	onItemClick?(...args: unknown[]): unknown;
	primaryFontFamily?: string;
};

/**
 * Renders a grid of buttons for the recently used characters. Those characters are cached centrally
 * during the lifetime of the browser window.
 *
 * If you use a character from this grid or the modal opened by {@link open-special-character-modal}
 * operation, that character is rendered in the beginning of this grid.
 *
 * It is possible to specify a fallback character set if any character has not been used yet. Beside
 * that, a maximum number of characters can be set to render in the grid.
 *
 * @fontosdk
 * @react
 * @category add-on/fontoxml-special-characters
 */
function RecentSymbolsGrid({
	fallbackCharacterSet,
	columns,
	maxCharacters,
	onItemClick,
	primaryFontFamily,
}: Props) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [characters, setCharacters] = useState(null);
	const recentSymbols = useManagerState(
		specialCharactersManager.recentSymbolsChangedNotifier,
		specialCharactersManager.getRecentSymbols
	);

	const setDefaultCharacterSet = useMemo(
		() =>
			onlyResolveLastPromise(async () => {
				if (
					fallbackCharacterSet &&
					recentSymbols.length < maxCharacters
				) {
					const fallbackCharacters =
						await specialCharactersManager.getCharacterSet(
							fallbackCharacterSet
						);

					if (fallbackCharacters) {
						for (const character of fallbackCharacters) {
							if (
								recentSymbols.some((e) => e.id === character.id)
							) {
								continue;
							}
							recentSymbols.push(character);

							if (recentSymbols.length >= maxCharacters) {
								break;
							}
						}
					}
				}

				return recentSymbols.slice(0, maxCharacters);
			}),
		[fallbackCharacterSet, maxCharacters, recentSymbols]
	);

	useEffect(() => {
		setDefaultCharacterSet()
			.then((chars) => {
				setCharacters(chars);
				setIsLoading(false);
			})
			.catch((err) => {
				setError(err);
				setIsLoading(false);
				console.error(err);
			});
	}, [setDefaultCharacterSet]);

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

	if (characters.length === 0) {
		return (
			<Block flex="1" applyCss={{ maxHeight: '100%' }}>
				<StateMessage
					title={t('You’ve not used special characters before.')}
					visual="meh-o"
				/>
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

RecentSymbolsGrid.defaultProps = {
	columns: 8,
	maxCharacters: 24,
	onItemClick: (_event) => {},
};

export default RecentSymbolsGrid;
