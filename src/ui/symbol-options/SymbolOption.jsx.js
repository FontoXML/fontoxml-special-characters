import React, { Component } from 'react';

import { Label, ListItem } from 'fontoxml-vendor-fds/components';

class SymbolOption extends Component {
	handleClick = () => this.props.onClick(this.props.option);

	render() {
		return (
			<ListItem
				isDisabled={this.props.isDisabled}
				isSelected={this.props.isSelected}
				onClick={this.handleClick}
				tooltipContent={this.props.option.label}
			>
				<Label>{this.props.option.label}</Label>
			</ListItem>
		);
	}
}

export default SymbolOption;
