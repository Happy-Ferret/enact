import ri from '@enact/ui/resolution';
import Item from '@enact/moonstone/Item';
import {VirtualVariableGridList} from '@enact/moonstone/VirtualList';
import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {withKnobs} from '@kadira/storybook-addon-knobs';

const
	style = {
		list: {
			overflow: 'hidden',
			width: '100%',
			height: ri.scale(576) + 'px'
		},
		itemWrapper: {
			background: 'black',
			position: 'absolute',
			willChange: 'transform'
		},
		itemHeader: {
			background: 'black',
			width: ri.scale(200) + 'px',
			height: ri.scale(96) + 'px',
			position: 'absolute',
			padding: ri.scale(50) + 'px ' + ri.scale(10) + 'px ' + ri.scale(10) + 'px',
			borderLeft: ri.scale(2) + 'px solid #333',
			boxSizing: 'border-box',
			bottom: '0',
			overflow: 'hidden',
			fontSize: ri.scale(27) + 'px',
			color: 'white',
			WebkitUserSelect: 'none',
			userSelect: 'none'
		},
		itemToday: {
			background: 'black',
			width: '100%',
			height: ri.scale(96) + 'px',
			position: 'absolute',
			padding: ri.scale(50) + 'px ' + ri.scale(10) + 'px ' + ri.scale(10) + 'px',
			boxSizing: 'border-box',
			bottom: '0',
			overflow: 'hidden',
			fontSize: ri.scale(27) + 'px',
			color: 'white',
			WebkitUserSelect: 'none',
			userSelect: 'none'
		},
		itemChannelInfoBG: {
			background: '#2C2E35',
			backgroundClip: 'content-box',
			padding: '0 ' + ri.scale(5) + 'px ' + ri.scale(5) + 'px 0',
			boxSizing: 'border-box',
			overflow: 'hidden',
			height: '100%'
		},
		itemChannelInfo: {
			width: ri.scale(400) + 'px',
			height: '100%',
			padding: ri.scale(10) + 'px 0 ' + ri.scale(10) + 'px ' + ri.scale(20) + 'px',
			boxSizing: 'border-box',
			color: '#CACACA',
			fontSize: ri.scale(27) + 'px',
			lineHeight: ri.scale(58) + 'px',
			WebkitUserSelect: 'none',
			userSelect: 'none'
		},
		itemBG: {
			background: '#141416',
			backgroundClip: 'content-box',
			padding: '0 ' + ri.scale(5) + 'px ' + ri.scale(5) + 'px 0',
			boxSizing: 'border-box',
			overflow: 'hidden',
			height: '100%'
		},
		item: {
			height: ri.scale(78) + 'px',
			boxSizing: 'border-box',
			fontSize: ri.scale(33) + 'px',
			lineHeight: ri.scale(78) + 'px',
			WebkitUserSelect: 'none',
			userSelect: 'none'
		}
	},
	programs = [],
	programName = [
		'On Demand',
		'To Be Announced',
		'Newsedge',
		'TMZ',
		'Dish Nation',
		'Access Hollywood',
		'The Wendy Williams Show',
		'Harry',
		'Extra',
		'Dish Nation',
		'TMZ',
		'FOX 2 News Morning',
		'Secrets of the Dead',
		'SciTech Now',
		'Under the Radar Michigan',
		'Tavis Smiley',
		'Charlie Rose',
		'Nature',
		'NOVA',
		'Secrets of the Dead'
	],
	channelInfo = [
		'A&E',
		'Adult Swim',
		'AMC',
		'Audience',
		'AXS TV',
		'BBC America',
		'BET',
		'Centric',
		'Chiller',
		'Cloo',
		'CMT',
		'Comedy Central',
		'Comedy.tv',
		'Discovery Channel',
		'Es.tv',
		'FIDO',
		'FX',
		'FXX',
		'GSN',
		'History'
	],
	timeline = [
		'06:00 AM', '06:30 AM',
		'07:00 AM', '07:30 AM',
		'08:00 AM', '08:30 AM',
		'09:00 AM', '09:30 AM',
		'10:00 AM', '10:30 AM',
		'11:00 AM', '11:30 AM',
		'12:00 PM', '12:30 PM',
		'01:00 PM', '01:30 PM',
		'02:00 PM', '02:30 PM',
		'03:00 PM', '03:30 PM'
	],
	variableMaxScrollSize = ri.scale(4000) /* 400 ( width per 1 hour )* 10 hr */,
	getRandomWidth = () => {
		return ri.scale((parseInt(Math.random() * 20) + 1) * 100);
	};

let sheet = document.createElement('style');
sheet.innerHTML = '.list > div:first-child {padding-top: 13px;}';
document.body.appendChild(sheet);

for (let i = 0; i < 200; i++) { /* 200 channelInfo */
	programs[i] = [];
	for (let j = 0; j < 40; j++) { /* The maximum number of programs per one channel is 40 */
		if (i === 0 && j === 0) {
			programs[i][j] = {
				width: 405,
				programName: 'Today'
			};
		} else if (j === 0) {
			programs[i][j] = {
				width: 405,
				programName: channelInfo[i % 20]
			};
		} else if (i === 0) {
			programs[i][j] = {
				width: 200,
				programName: timeline[(j - 1) % 20]
			};
		} else {
			programs[i][j] = {
				width: getRandomWidth(),
				programName: ('00' + i).slice(-3) + '/' + ('00' + j).slice(-3) + ' - ' + programName[(i + j) % 20]
			};
		}
	}
}

const
	getVariableDataSize = ({data, fixedIndex}) => {
		return data[fixedIndex].length;
	},
	getVariableItemSize = ({data, index}) => {
		return data[index.fixed][index.variable].width;
	},
	renderItem = ({data, index, key}) => {
		if (index.fixed == 0) {
			return (
				<div key={key} style={style.itemWrapper}>
					<div style={index.variable === 0 ? style.itemToday : style.itemHeader}>
						{data[index.fixed][index.variable].programName}
					</div>
				</div>
			);
		} else if (index.variable === 0) {
			return (
				<div key={key} style={style.itemWrapper}>
					<div style={style.itemChannelInfoBG}>
						<div style={style.itemChannelInfo}>
							{data[index.fixed][index.variable].programName}
						</div>
					</div>
				</div>
			);
		} else  {
			return (
				<div key={key} style={style.itemWrapper}>
					<div style={style.itemBG}>
						<Item style={style.item}>
							{data[index.fixed][index.variable].programName}
						</Item>
					</div>
				</div>
			);
		}
	};

storiesOf('VirtualVariableGridList')
	.addDecorator(withKnobs)
	.addWithInfo(
		'for EGP Grid',
		() => (
			<VirtualVariableGridList
				data={programs}
				dataSize={{
					fixed: programs.length,
					variable: getVariableDataSize
				}}
				itemSize={{
					fixed: ri.scale(83),
					variable: getVariableItemSize
				}}
				variableDimension={'width'}
				variableMaxScrollSize={variableMaxScrollSize}
				style={style.list}
				className={'list'}
				headerComponent
				component={renderItem}
			/>
		)
	);
