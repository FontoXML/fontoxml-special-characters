import React, { Component } from 'react';

import { Flex, GridItem, UnicodeSymbol, VirtualGrid } from 'fds/components';

const gridPaddingSize = { horizontal: 'l', bottom: 'l' };

class Symbols extends Component {
	renderCodePoints = codePoints => {
		const unicodeSymbols = codePoints.map((codePoint, key) => (
			<UnicodeSymbol code={codePoint} key={key} size="m" />
		));

		if (codePoints.length > 1) {
			return (
				<Flex alignItems="center" justifyContent="center" spaceHorizontalSize="s">
					{unicodeSymbols}
				</Flex>
			);
		}

		return unicodeSymbols;
	};

	handleRenderGridItem = ({ isSelected, item, key, onClick, onDoubleClick, size }) => (
		<GridItem
			isDisabled={item.isDisabled || !item.name}
			isSelected={isSelected}
			key={key}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			size={size}
			type="unicode-symbol"
		>
			{item.name && this.renderCodePoints(item.codePoints)}
		</GridItem>
	);

	render() {
		const { onSymbolClick, onSymbolDoubleClick, selectedSymbols, symbols } = this.props;

		return (
			<Flex flex="1">
				<VirtualGrid
					estimatedRowHeight={48}
					items={symbols}
					itemSize="s"
					onItemClick={onSymbolClick}
					onItemDoubleClick={onSymbolDoubleClick}
					paddingSize={gridPaddingSize}
					renderItem={this.handleRenderGridItem}
					selectedItems={selectedSymbols}
					spaceSize="m"
					virtualBufferFactor={4}
				/>
			</Flex>
		);
	}
}

export default Symbols;
