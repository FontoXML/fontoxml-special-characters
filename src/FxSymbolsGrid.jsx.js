import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Grid } from 'fontoxml-vendor-fds/components';

import FxOperationSymbolGridItem from './ui/FxOperationSymbolGridItem.jsx';
import specialCharactersManager from './specialCharactersManager';

class FxSymbolsGrid extends Component {
	static defaultProps = {
		columns: 8,
		onItemClick: _event => {}
	};

	static propTypes = {
		characterSet: PropTypes.string,
		columns: PropTypes.number,
		onItemClick: PropTypes.func
	};

	state = {
		characters:
			specialCharactersManager
				.getCharacterSet(this.props.characterSet)
				.map((character, index) => ({ id: index, ...character })) || []
	};

	componentWillReceiveProps(nextProps) {
		if (nextProps.characterSet !== this.props.characterSet) {
			this.setState({
				characters:
					specialCharactersManager
						.getCharacterSet(nextProps.characterSet)
						.map((character, index) => ({ id: index, ...character })) || []
			});
		}
	}

	renderSymbolItem = ({ item, itemSize, key, onClick }) => {
		const text = item.codePoints
			.map(codePoint => String.fromCodePoint(parseInt(codePoint.substr(2), 16)))
			.join('');

		return (
			<FxOperationSymbolGridItem
				character={item}
				key={key}
				onClick={onClick}
				operationData={{ text }}
				operationName="insert-text"
				size={itemSize}
			/>
		);
	};

	render() {
		return (
			<Grid
				items={this.state.characters}
				itemSize="xs"
				maxColumns={this.props.columns}
				onItemClick={this.props.onItemClick}
				paddingSize="s"
				renderItem={this.renderSymbolItem}
				spaceSize="s"
			/>
		);
	}
}

export default FxSymbolsGrid;
