import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Flex, GridItem, UnicodeSymbol } from 'fds/components';
import FxOperation from 'fontoxml-fx/FxOperation.jsx';

class OperationSymbolGridItem extends Component {
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

	render() {
		const { character, onClick, operationData, operationName, size } = this.props;

		return (
			<FxOperation operationData={operationData} operationName={operationName}>
				{({ operationState, executeOperation }) => (
					<GridItem
						isDisabled={!operationState.enabled}
						onClick={event => {
							executeOperation();
							onClick(event);
						}}
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
							{character.codePoints.map((codePoint, index) => (
								<UnicodeSymbol code={codePoint} key={index} size="s" />
							))}
						</Flex>
					</GridItem>
				)}
			</FxOperation>
		);
	}
}

export default OperationSymbolGridItem;
