import { Label, ListItem } from 'fds/components';
import React, { Component } from 'react';

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
