// Moonstone Environment

import kind from '@enact/core/kind';
import React from 'react';
import PropTypes from 'prop-types';
import MoonstoneDecorator from '@enact/moonstone/MoonstoneDecorator';
import {Panels, Panel, Header} from '@enact/moonstone/Panels';
import {boolean, select} from '@storybook/addon-knobs';

import css from './MoonstoneEnvironment.less';

const reloadPage = () => {
	const {protocol, host, pathname} = window.parent.location;
	window.parent.location.href = protocol + '//' + host + pathname;
};

const PanelsBase = kind({
	name: 'MoonstoneEnvironment',

	propTypes: {
		description: PropTypes.string,
		title: PropTypes.string
	},

	render: ({children, title, description, ...rest}) => (
		<div {...rest}>
			<Panels onApplicationClose={reloadPage}>
				<Panel>
					<Header type="compact" title={title} casing="preserve" />
					<div className={css.description}>
						<p>{description}</p>
					</div>
					{children}
				</Panel>
			</Panels>
		</div>
	)
});

const FullscreenBase = kind({
	name: 'MoonstoneEnvironment',

	render: (props) => (
		<div {...props} />
	)
});

const Moonstone = MoonstoneDecorator({overlay: false}, PanelsBase);
const MoonstoneFullscreen = MoonstoneDecorator({overlay: false}, FullscreenBase);

// NOTE: Locales taken from strawman. Might need to add more in the future.
const locales = {
	'local': 'local',
	'en-US': 'en-US - US English',
	'ko-KR': 'ko-KR - Korean',
	'es-ES': 'es-ES - Spanish, with alternate weekends',
	'am-ET': 'am-ET - Amharic, 6 meridiems',
	'th-TH': 'th-TH - Thai, with tall characters',
	'ar-SA': 'ar-SA - Arabic, RTL and standard font',
	'ur-PK': 'ur-PK - Urdu, RTL and custom Urdu font',
	'zh-Hant-HK': 'zh-Hant-HK - Traditional Chinese, custom Hant font',
	'vi-VN': 'vi-VN - Vietnamese, Special non-latin font handling',
	'ja-JP': 'ja-JP - Japanese, custom Japanese font',
	'en-JP': 'en-JP - English, custom Japanese font'
};

const skins = {
	dark: 'Dark',
	light: 'Light'
};

// NOTE: Knobs cannot set locale in fullscreen mode. This allows any knob to be taken from the URL.
const getPropFromURL = (propName, fallbackValue) => {
	propName = encodeURI(propName);
	const locationParams = window.parent.location.search;

	const startIndex = locationParams.indexOf('knob-' + propName);
	if (startIndex > -1) {
		const keyIndex = locationParams.indexOf('=', startIndex);

		if (locationParams.indexOf('&', keyIndex) > -1 ) {
			const valueIndex = locationParams.indexOf('&', keyIndex);
			return locationParams.substring(keyIndex + 1, valueIndex);
		} else {
			return locationParams.substring(keyIndex + 1, locationParams.length);
		}
	}

	return fallbackValue;
};

const StorybookDecorator = (story, config) => {
	const sample = story();
	return (
		<Moonstone
			title={`${config.kind} ${config.story}`.trim()}
			description={config.description}
			locale={select('locale', locales, getPropFromURL('locale', 'en-US'))}
			textSize={boolean('large text', (getPropFromURL('large text') === 'true')) ? 'large' : 'normal'}
			highContrast={boolean('high contrast', (getPropFromURL('high contrast') === 'true'))}
			skin={select('skin', skins, getPropFromURL('skin'))}
		>
			{sample}
		</Moonstone>
	);
};

const FullscreenStorybookDecorator = (story, config) => {
	const sample = story();
	return (
		<MoonstoneFullscreen
			title={`${config.kind} ${config.story}`.trim()}
			description={config.description}
			locale={select('locale', locales, getPropFromURL('locale', 'en-US'))}
			textSize={boolean('large text', (getPropFromURL('large text') === 'true')) ? 'large' : 'normal'}
			highContrast={boolean('high contrast', (getPropFromURL('high contrast') === 'true'))}
			skin={select('skin', skins, getPropFromURL('skin'))}
		>
			{sample}
		</MoonstoneFullscreen>
	);
};

export default StorybookDecorator;
export {StorybookDecorator as Moonstone, FullscreenStorybookDecorator as MoonstoneFullscreen};
