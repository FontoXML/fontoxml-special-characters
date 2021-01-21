import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { SpinnerIcon, StateMessage, Block } from 'fds/components';

import t from 'fontoxml-localization/src/t.js';
import onlyResolveLastPromise from 'fontoxml-utils/src/onlyResolveLastPromise.js';

import BaseSymbolsGrid from './ui/BaseSymbolsGrid.jsx';
import specialCharactersManager from './specialCharactersManager.js';

const setDefaultConfigurationsPromise = () =>
	onlyResolveLastPromise(async (maxCharacters, characterSetName) => {
		const recentSymbols = specialCharactersManager.getRecentSymbols();

		if (recentSymbols.length < maxCharacters) {
			const fallbackCharacterSet = await specialCharactersManager.getCharacterSet(
				characterSetName
			);

			if (fallbackCharacterSet) {
				for (const character of fallbackCharacterSet) {
					if (recentSymbols.some(e => e.id === character.id)) {
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
	});

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
	primaryFontFamily
}) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [characters, setCharacters] = useState(null);

	const setDefaultCharacterSet = useMemo(setDefaultConfigurationsPromise, []);

	useEffect(() => {
		setDefaultCharacterSet(maxCharacters, fallbackCharacterSet)
			.then(chars => {
				setCharacters(chars);
				setIsLoading(false);
			})
			.catch(err => {
				setError(err);
				setIsLoading(false);
				console.error(err);
			});
	}, [setDefaultCharacterSet, maxCharacters, fallbackCharacterSet, setCharacters]);

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
	onItemClick: _event => {}
};

RecentSymbolsGrid.propTypes = {
	/**
	 * The name of the character set to display, as used in
	 * {@link SpecialCharactersManager#addCharacterSet}. When there is no recently used symbols
	 * enough yet, these characters will be shown after the recent symbols.
	 */
	fallbackCharacterSet: PropTypes.string,

	/**
	 * The number of columns to use in the grid.
	 */
	columns: PropTypes.number,

	/**
	 * The maximum number of characters to use in the grid. Recommended to use a multiple of columns.
	 */
	maxCharacters: PropTypes.number,

	/**
	 * Function to be called when an item in the grid is clicked.
	 *
	 * This can be used, for example, to close the {@link Drop} containing the grid when a character is inserted.
	 *
	 * @type {FX~OnItemClickCallback}
	 */
	onItemClick: PropTypes.func,

	/**
	 * A CSS font-family string that will be prepended to the default FDS 'content' font-family to
	 * render the Unicode symbols.
	 * (The default 'content' font-family is: Merriweather, Georgia, 'Times New Roman', Times,
	 * BravuraRegular, BravuraTextRegular, Code2000Regular, Code2001Regular, serif).
	 * Note: when the browser renders a character (of a Unicode symbol) it uses the first font in
	 * the font-family string that has a glyph for that character. So by prepending a custom font
	 * name, that font gets the first chance to provide a glyph and render the character.
	 *
	 * This can be used to render certain unicode icons you use commonly in your publications with
	 * your own custom (publication) font.
	 * This is usually set when using a custom (publication) font for certain/all parts of your
	 * document in the editor (via the {@link registerFontStack} API and related fontStack CVK
	 * option).
	 *
	 * Setting the same font-family for both the CVK content and the special characters UI ensures
	 * users do not get confused by having the same symbol render differently in different places.
	 */
	primaryFontFamily: PropTypes.string
};

export default RecentSymbolsGrid;
