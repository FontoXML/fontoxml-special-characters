import React from 'react';

import { Flex, Heading, Text, UnicodeSymbol } from 'fontoxml-vendor-fds/components';

const previewStyles = { width: '100%' };

const FxSymbolPreview = ({ symbol }) =>
	<Flex
		alignItems="center"
		applyCss={previewStyles}
		flex="1"
		flexDirection="column"
		justifyContent="center"
		paddingSize="m"
		spaceSize="m"
	>
		<Flex inline={true} spaceSize="s">
			{symbol.codePoints.map((codePoint, key) =>
				<UnicodeSymbol align="center" code={codePoint} key={key} size="l" />
			)}
		</Flex>

		<Heading align="center" level="4" isBold>{symbol.name}</Heading>

		<Text align="center">
			{symbol.codePoints.join(', ')}
		</Text>
	</Flex>;

export default FxSymbolPreview;
