import React from 'react';

import { Flex, Heading, Text, UnicodeSymbol } from 'fds/components';

const previewStyles = { width: '100%' };

const SymbolPreview = ({ symbol }) => (
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
				<UnicodeSymbol code={codePoint} key={key} size="l" />
			))}
		</Flex>

		<Heading align="center" level="4" isBold>
			{symbol.name}
		</Heading>

		<Text align="center">{symbol.codePoints.join(', ')}</Text>
	</Flex>
);

export default SymbolPreview;
