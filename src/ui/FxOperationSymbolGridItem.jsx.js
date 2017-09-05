import PropTypes from 'prop-types';
import React, { Component } from 'react';

import withOperationState from 'fontoxml-fx/withOperationState.jsx';

import { Flex, GridItem, UnicodeSymbol } from 'fontoxml-vendor-fds/components';

class FxOperationSymbolGridItem extends Component {
	static defaultProps = {
		onClick: _event => {},
		operationData: {},
		size: 'xs'
	};

	static propTypes = {
		character: PropTypes.shape({
			codePoints: PropTypes.array.isRequired,
			name: PropTypes.string.isRequired
		}).isRequired,
		onClick: PropTypes.func,
		operationData: PropTypes.object,
		operationName: PropTypes.string.isRequired,
		size: PropTypes.oneOf(['xs', 's', 'm', 'l'])
	};

	handleClick = () => {
		// from withOperationState()
		this.props.handleClick();
		// own optional prop
		this.props.onClick();
	};

	render() {
		const { character, operationState, size } = this.props;

		return (
			<GridItem
				isDisabled={!operationState.enabled}
				onClick={this.handleClick}
				tooltipContent={character.name}
				size={size}
				type="unicode-symbol"
			>
				<Flex
					alignItems="center"
					applyCss={{ height: '0.875rem' }}
					justifyContent="center"
					spaceSize="s"
				>
					{character.codePoints.map((codePoint, index) =>
						<UnicodeSymbol code={codePoint} key={index} size="s" />
					)}
				</Flex>
			</GridItem>
		);
	}
}

FxOperationSymbolGridItem = withOperationState()(FxOperationSymbolGridItem);

export default FxOperationSymbolGridItem;
