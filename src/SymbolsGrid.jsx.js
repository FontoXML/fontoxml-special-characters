import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Grid } from 'fds/components';

import OperationSymbolGridItem from './ui/OperationSymbolGridItem.jsx';
import specialCharactersManager from './specialCharactersManager';

/**
 * Renders a grid of buttons for each of the characters in the specified character set.
 *
 * @fontosdk
 * @category add-on/fontoxml-special-characters
 */
class SymbolsGrid extends Component {
	static defaultProps = {
		columns: 8,
		onItemClick: _event => {}
	};

	static propTypes = {
		/**
		 * The name of the character set to display, as used in {@link SpecialCharactersManager#addCharacterSet}.
		 */
		characterSet: PropTypes.string.isRequired,

		/**
		 * The number of columns to use in the grid.
		 */
		columns: PropTypes.number,

		/**
		 * Function to be called when an item in the grid is clicked.
		 *
		 * This can be used, for example, to close the {@link Drop} containing the grid when a character is inserted.
		 *
		 * @type {FX~OnItemClickCallback}
		 */
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
			<OperationSymbolGridItem
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

export default SymbolsGrid;
