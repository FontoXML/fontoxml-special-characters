import { Flex, Grid, GridItem, UnicodeSymbol } from 'fds/components';
import React from 'react';

import useOperation from 'fontoxml-fx/src/useOperation';

import characterToString from '../api/characterToString';
import specialCharactersManager from '../specialCharactersManager';

const defaultOperationData = { text: ' ' };

type Props = {
	/**
	 * @remarks
	 * The characterSet to display, as used in {@link
	 * SpecialCharactersManager#addCharacterSet}. It should not be empty, so please
	 * handle empty characterSets before rendering this component.
	 */
	characters?: unknown[];
	/**
	 * @remarks
	 * The number of columns to use in the grid.
	 */
	columns?: number;
	/**
	 * @remarks
	 * Function to be called when an item in the grid is clicked.
	 *
	 * This can be used, for example, to close the {@link Drop} containing the grid
	 * when a character is inserted.
	 *
	 * {@inheritDoc fds/types#FdsOnItemClickCallback}
	 */
	onItemClick?(...args: unknown[]): unknown;
	/**
	 * @remarks
	 * A CSS font-family string that will be prepended to the default FDS 'content'
	 * font-family to render the Unicode symbols. (The default 'content' font-family
	 * is: Merriweather, Georgia, 'Times New Roman', Times, BravuraRegular,
	 * BravuraTextRegular, Code2000Regular, Code2001Regular, serif). Note: when the
	 * browser renders a character (of a Unicode symbol) it uses the first font in the
	 * font-family string that has a glyph for that character. So by prepending a
	 * custom font name, that font gets the first chance to provide a glyph and render
	 * the character.
	 *
	 * This can be used to render certain unicode icons you use commonly in your
	 * publications with your own custom (publication) font. This is usually set when
	 * using a custom (publication) font for certain/all parts of your document in the
	 * editor (via the {@link registerFontStack} API and related fontStack CVK option).
	 *
	 * Setting the same font-family for both the CVK content and the special characters
	 * UI ensures users do not get confused by having the same symbol render
	 * differently in different places.
	 */
	primaryFontFamily?: string;
};

function BaseSymbolsGrid({
	characters,
	columns,
	onItemClick,
	primaryFontFamily,
}: Props) {
	const { executeOperation, operationState } = useOperation(
		'insert-text',
		defaultOperationData
	);

	return (
		<Grid
			items={characters}
			itemSize="xs"
			maxColumns={columns}
			onItemClick={onItemClick}
			paddingSize="s"
			renderItem={({ item, itemSize, key, onClick }) => {
				const text = characterToString(item);

				return (
					<GridItem
						key={key}
						cursor="pointer"
						isDisabled={!operationState.enabled}
						onClick={(event) => {
							specialCharactersManager.markAsRecentlyUsed(item);

							// This is undocumented behavior of useOperation's executeOperation().
							// It is a 'necessary evil' here.
							executeOperation({ text });

							onClick(event);
						}}
						tooltipContent={item.name ? item.name : null}
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
								<UnicodeSymbol
									code={codePoint}
									key={index}
									size="s"
									primaryFontFamily={primaryFontFamily}
								/>
							))}
						</Flex>
					</GridItem>
				);
			}}
			spaceSize="s"
		/>
	);
}

BaseSymbolsGrid.defaultProps = {
	columns: 8,
	onItemClick: (_event) => {},
};

export default BaseSymbolsGrid;
