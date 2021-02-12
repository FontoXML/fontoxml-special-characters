import React, { Component } from 'react';

import { Flex, GridItem, UnicodeSymbol, VirtualGrid } from 'fds/components';

const gridPaddingSize = { horizontal: 'l', bottom: 'l' };

class Symbols extends Component {
	renderCodePoints = codePoints => {
		const unicodeSymbols = codePoints.map((codePoint, key) => (
			<UnicodeSymbol
				code={codePoint}
				key={key}
				primaryFontFamily={this.props.primaryFontFamily}
				size="m"
			/>
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

	handleRenderGridItem = ({ item, key, onClick, onDoubleClick, size }) => (
		<GridItem
			isDisabled={item.isDisabled || !item.codePoints}
			isSelected={item === this.props.selectedSymbol}
			key={key}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			size={size}
			type="unicode-symbol"
		>
			{item.codePoints && this.renderCodePoints(item.codePoints)}
		</GridItem>
	);

	render() {
		const { onSymbolClick, onSymbolDoubleClick, selectedSymbol, symbols } = this.props;

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
					idToScrollIntoView={selectedSymbol ? selectedSymbol.id : null}
					spaceSize="m"
					virtualBufferFactor={4}
				/>
			</Flex>
		);
	}
}

export default Symbols;
