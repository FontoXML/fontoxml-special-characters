import React from 'react';

import { Flex, Heading, List, TextLink } from 'fds/components';

import SymbolOption from './SymbolOption.jsx';

const listPaddingSize = { bottom: 'm', horizontal: 'm' };

const handleRenderItem = ({ isSelected, item: option, key, onClick }) => (
	<SymbolOption
		isDisabled={option.isDisabled}
		isSelected={isSelected}
		key={key}
		onClick={onClick}
		option={option}
	/>
);

const SymbolOptions = ({
	clearButtonLabel,
	flex,
	headingLabel,
	onClearClick,
	onOptionClick,
	options,
	selectedOption
}) => (
	<Flex flex={flex} flexDirection="column">
		<Flex alignItems="center" flex="none" paddingSize="m" spaceSize="l">
			<Heading colorName="text-muted-color" level="4">
				{headingLabel}
			</Heading>

			{clearButtonLabel && onClearClick && selectedOption && (
				<TextLink
					icon="times-circle"
					isInline
					label={clearButtonLabel}
					onClick={onClearClick}
				/>
			)}
		</Flex>

		<List
			items={options}
			onItemClick={onOptionClick}
			paddingSize={listPaddingSize}
			selectedItem={selectedOption}
			renderItem={handleRenderItem}
		/>
	</Flex>
);

export default SymbolOptions;
