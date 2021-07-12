import { Flex, Grid, GridItem, UnicodeSymbol } from 'fds/components';
import React from 'react';

import useOperation from 'fontoxml-fx/src/useOperation';

import characterToString from '../api/characterToString';
import specialCharactersManager from '../specialCharactersManager';

const defaultOperationData = { text: ' ' };

type Props = {
	characters?: unknown[];
	columns?: number;
	onItemClick?(...args: unknown[]): unknown;
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
