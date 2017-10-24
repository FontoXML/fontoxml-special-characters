import React, { Component } from 'react';

import { Flex, GridItem, UnicodeSymbol, VirtualGrid } from 'fds/components';

const gridItemContentStyles = { height: '1.875rem' };

const gridPaddingSize = { horizontal: 'l', bottom: 'l' };

class Symbols extends Component {
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
			{item.name && (
				<Flex
					alignItems="center"
					applyCss={gridItemContentStyles}
					justifyContent="center"
					spaceSize="s"
				>
					{item.codePoints.map((codePoint, key) => (
						<UnicodeSymbol code={codePoint} key={key} size="m" />
					))}
				</Flex>
			)}
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
				/>
			</Flex>
		);
	}
}

export default Symbols;
