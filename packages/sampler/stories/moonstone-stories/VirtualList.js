import ri from '@enact/ui/resolution';
import Item from '@enact/moonstone/Item';
import VirtualList from '@enact/moonstone/VirtualList';
import VirtualListBase from '@enact/moonstone/VirtualList/VirtualListBase';
import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {withKnobs, number} from '@kadira/storybook-addon-knobs';

VirtualList.displayName = 'VirtualList';
VirtualList.propTypes = Object.assign({}, VirtualListBase.propTypes);
VirtualList.defaultProps = Object.assign({}, VirtualListBase.defaultProps);

const
	style = {
		verticalItem : {
			position: 'absolute',
			width: '100%',
			height: ri.scale(72) + 'px',
			borderBottom: ri.scale(2) + 'px solid #202328',
			boxSizing: 'border-box',

			color: 'white',
			fontSize: ri.scale(40) + 'px',
			lineHeight: ri.scale(70) + 'px',
			textAlign: 'center'
		},
		horizontalItem : {
			position: 'absolute',
			hieght: ri.scale(550) + 'px',
			width: ri.scale(270) + 'px',
			borderRight: ri.scale(2) + 'px solid #202328',
			boxSizing: 'border-box',

			color: 'white',
			fontSize: ri.scale(40) + 'px',
			lineHeight: ri.scale(550) + 'px',
			textAlign: 'center'
		},
		listHeight : {
			height: ri.scale(550) + 'px'
		}
	},
	data = [];

for (let i = 0; i < 1000; i++) {
	data.push('Item ' + ('00' + i).slice(-3));
}

const renderVerticalItem = ({index, key}) =>
	<Item key={key} style={style.verticalItem}>
		{data[index]}
	</Item>;

const renderHorizontalItem = ({index, key}) =>
	<Item key={key} style={style.horizontalItem}>
		{data[index]}
	</Item>;

storiesOf('VirtualList')
	.addDecorator(withKnobs)
	.addWithInfo(
		'with vertical direction',
		'Basic usage of VirtualList',
		() => (
			<VirtualList
				data={data}
				dataSize={number('dataSize', data.length)}
				direction='vertical'
				itemSize={ri.scale(number('itemSize', 72))}
				spacing={ri.scale(number('spacing', 0))}
				style={style.listHeight}
				component={renderVerticalItem}
			/>
		)
	)
	.addWithInfo(
		'with horizontal direction',
		() => (
			<VirtualList
				data={data}
				dataSize={number('dataSize', data.length)}
				direction='horizontal'
				itemSize={ri.scale(number('itemSize', 270))}
				spacing={ri.scale(number('spacing', 0))}
				style={style.listHeight}
				component={renderHorizontalItem}
			/>
		)
	);
