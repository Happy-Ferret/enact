import Picker from '@enact/moonstone/Picker';
import {icons} from '@enact/moonstone/Icon';
import PickerAddRemove from './components/PickerAddRemove';
import PickerRTL from './components/PickerRTL';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {boolean, select} from '@storybook/addon-knobs';
import nullify from '../../src/utils/nullify.js';

const prop = {
	orientation: ['horizontal', 'vertical'],
	width: [null, 'small', 'medium', 'large']
};

const iconNames = Object.keys(icons);

const pickerList = {
	tall: [
		'नरेंद्र मोदी',
		' ฟิ้  ไั  ஒ  து',
		'ÃÑÕÂÊÎÔÛÄËÏÖÜŸ'
	],
	long: [
		'Looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong Text1',
		'Looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong Text2',
		'Looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong Text3',
		'Looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong Text4',
		'Looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong Text5'
	],
	vegetables: [
		'Celery',
		'Carrot',
		'Tomato',
		'Onion',
		'Broccoli',
		'Spinach'
	],
	oneAirport: [
		'San Francisco Airport Terminal Gate 1'
	],
	emptyList: [],
	orderedList: [
		'A',
		'B',
		'C',
		'D',
		'E',
		'F'
	]
};

storiesOf('Picker', module)
	.add(
		'with long text',
		() => (
			<Picker
				onChange={action('onChange')}
				width={nullify(select('width', prop.width, 'large'))}
				orientation={select('orientation', prop.orientation, 'horizontal')}
				wrap={boolean('wrap')}
				joined={boolean('joined')}
				noAnimation={boolean('noAnimation')}
				disabled={boolean('disabled')}
				incrementIcon={select('incrementIcon', iconNames)}
				decrementIcon={select('decrementIcon', iconNames)}
			>
				{pickerList.long}
			</Picker>
		)
	)
	.add(
		'with tall characters',
		() => (
			<Picker
				onChange={action('onChange')}
				width={nullify(select('width', prop.width, 'large'))}
				orientation={select('orientation', prop.orientation, 'horizontal')}
				wrap={boolean('wrap')}
				joined={boolean('joined')}
				noAnimation={boolean('noAnimation')}
				disabled={boolean('disabled')}
				incrementIcon={select('incrementIcon', iconNames)}
				decrementIcon={select('decrementIcon', iconNames)}
			>
				{pickerList.tall}
			</Picker>
		)
	)
	.add(
		'with a default value',
		() => (
			<Picker
				onChange={action('onChange')}
				width={nullify(select('width', prop.width, 'medium'))}
				orientation={select('orientation', prop.orientation, 'horizontal')}
				wrap={boolean('wrap')}
				joined={boolean('joined')}
				noAnimation={boolean('noAnimation')}
				disabled={boolean('disabled')}
				incrementIcon={select('incrementIcon', iconNames)}
				decrementIcon={select('decrementIcon', iconNames)}
				defaultValue={2}
			>
				{pickerList.vegetables}
			</Picker>
		)
	)
	.add(
		'with no items (PLAT-30963)',
		() => (
			<Picker
				onChange={action('onChange')}
				width={select('width', prop.width, 'large')}
				orientation={select('orientation', prop.orientation)}
				wrap={boolean('wrap', true)}
				joined={boolean('joined')}
				noAnimation={boolean('noAnimation')}
				disabled={boolean('disabled')}
				incrementIcon={select('incrementIcon', iconNames)}
				decrementIcon={select('decrementIcon', iconNames)}
			>
				{[]}
			</Picker>
		)
	)
	.add(
		'with one item',
		() => (
			<Picker
				onChange={action('onChange')}
				width={nullify(select('width', prop.width, 'large'))}
				orientation={select('orientation', prop.orientation)}
				wrap={boolean('wrap', true)}
				joined={boolean('joined')}
				noAnimation={boolean('noAnimation')}
				disabled={boolean('disabled')}
				incrementIcon={select('incrementIcon', iconNames)}
				decrementIcon={select('decrementIcon', iconNames)}
			>
				{pickerList.oneAirport}
			</Picker>
		)
	)
	.add(
		'with item add/remove (ENYO-2448)',
		() => (
			<PickerAddRemove
				width={select('width', prop.width, 'medium')}
				orientation={select('orientation', prop.orientation, 'horizontal')}
				wrap={boolean('wrap')}
				joined={boolean('joined')}
				noAnimation={boolean('noAnimation')}
				disabled={boolean('disabled')}
			>
				{pickerList.emptyList}
			</PickerAddRemove>
		)
	)
	.add(
		'RTL Layout (PLAT-28123)',
		() => (
			<PickerRTL
				width={select('width', prop.width, 'medium')}
				wrap={boolean('wrap')}
				joined={boolean('joined')}
				noAnimation={boolean('noAnimation')}
				disabled={boolean('disabled')}
			>
				{pickerList.orderedList}
			</PickerRTL>
		)
	);
