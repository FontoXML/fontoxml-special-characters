import { Flex, Heading, Text, UnicodeSymbol } from 'fds/components';
import React from 'react';

const previewStyles = { width: '100%' };

const SymbolPreview = ({ primaryFontFamily, symbol }) => (
	<Flex
		alignItems="center"
		applyCss={previewStyles}
		flex="1"
		flexDirection="column"
		justifyContent="center"
		paddingSize="m"
		spaceSize="m"
	>
		<Flex alignItems="center" spaceSize="s">
			{symbol.codePoints.map((codePoint, key) => (
				<UnicodeSymbol
					code={codePoint}
					key={key}
					primaryFontFamily={primaryFontFamily}
					size="l"
				/>
			))}
		</Flex>

		<Heading align="center" level="4" isBold>
			{symbol.name ? symbol.name : null}
		</Heading>

		<Text align="center">{symbol.codePoints.join(', ')}</Text>
	</Flex>
);

export default SymbolPreview;
