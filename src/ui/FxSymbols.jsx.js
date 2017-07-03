import React, { Component } from 'react';

import { Flex, GridItem, UnicodeSymbol, VirtualGrid } from 'fontoxml-vendor-fds/components';

const gridItemContentStyles = { height: '1.875rem' };

const gridPaddingSize = { horizontal: 'l', bottom: 'l' };

class FxSymbols extends Component {
	// TODO: do not fuck angular again after angular has been fucked out of existence in the whole code base
	state = { fuAngular: false };

	handleRenderGridItem = ({ isDisabled, isInvalid, isSelected, item, key, onClick, onDoubleClick, size }) => (
		<GridItem
			isDisabled={ isDisabled || !item.name }
			isInvalid={ isInvalid }
			isSelected={ isSelected }
			key={ key }
			onClick={ onClick }
			onDoubleClick={ onDoubleClick }
			size={ size }
			type='unicode-symbol'
		>
			{ item.name && (
				<Flex alignItems='center' applyCss={ gridItemContentStyles } justifyContent='center' spaceSize='s'>
					{ item.codePoints.map(function (codePoint, key) {
						return <UnicodeSymbol code={ codePoint } key={ key } size='m'/>;
					} ) }
				</Flex>
			) }
		</GridItem>
	);

	render () {
		const { onSymbolClick, onSymbolDoubleClick, selectedSymbols, symbols } = this.props;
		const { fuAngular } = this.state;

		return (
			<Flex flex='1'>
				{ fuAngular && (
					<VirtualGrid
						estimatedRowHeight={ 48 }
						items={ symbols }
						itemSize='s'
						onItemClick={ onSymbolClick }
						onItemDoubleClick={ onSymbolDoubleClick }
						paddingSize={ gridPaddingSize }
						renderItem={ this.handleRenderGridItem }
						selectedItems={ selectedSymbols }
						spaceSize='m'
					/>
				) }
			</Flex>
		);
	}

	componentDidMount () {
		requestAnimationFrame(() => this.setState({ fuAngular: true }));
	}
}

export default FxSymbols;
