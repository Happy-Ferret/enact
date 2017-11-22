/**
 * Exports the {@link moonstone/Icon.Icon} component and the list of icon constants as
 * [iconList]{@link moonstone/Icon.iconList}.
 *
 * @module moonstone/Icon
 */

import kind from '@enact/core/kind';
import IconFactory from '@enact/ui/IconFactory';
import Pure from '@enact/ui/internal/Pure';
import React from 'react';

import Skinnable from '../Skinnable';

import iconList from './IconList.js';

import css from './Icon.less';

const UiIcon = IconFactory({css});

/**
 * {@link moonstone/Icon.Icon} is a component that displays an icon image.  You may
 * specify an image, by setting the `src` property, or a font-based icon, by setting the child to a
 * string from the [IconList]{@link moonstone/Icon.IconList}.  If both `src` and
 * children are specified, both will be rendered.
 *
 * Usage:
 * ```
 * <Icon small>
 *     plus
 * </Icon>
 * ```
 *
 * @class Icon
 * @memberof moonstone/Icon
 * @ui
 * @public
 */
const IconBase = kind({
	name: 'Icon',

	render: (props) => (
		<UiIcon {...props} iconList={iconList} />
	)
});

// Let's find a way to import this list directly, and bonus feature, render our icons in the docs next to their names.
/**
 * {@link moonstone/Icon.iconList} is an object whose keys can be used as the child of an
 * {@link moonstone/Icon.Icon} component.
 *
 * List of Icons:
 * ```
 * plus
 * minus
 * arrowhookleft
 * arrowhookright
 * ellipsis
 * check
 * circle
 * stop
 * play
 * pause
 * forward
 * backward
 * skipforward
 * skipbackward
 * pauseforward
 * pausebackward
 * pausejumpforward
 * pausejumpbackward
 * jumpforward
 * jumpbackward
 * denselist
 * bulletlist
 * list
 * drawer
 * arrowlargedown
 * arrowlargeup
 * arrowlargeleft
 * arrowlargeright
 * arrowsmallup
 * arrowsmalldown
 * arrowsmallleft
 * arrowsmallright
 * closex
 * search
 * rollforward
 * rollbackward
 * exitfullscreen
 * fullscreen
 * arrowshrinkleft
 * arrowshrinkright
 * arrowextend
 * arrowshrink
 * flag
 * funnel
 * trash
 * star
 * hollowstar
 * halfstar
 * gear
 * plug
 * lock
 * forward15
 * back15
 * continousplay
 * playlist
 * resumeplay
 * image
 * audio
 * music
 * languages
 * cc
 * ccon
 * ccoff
 * sub
 * recordings
 * livezoom
 * liveplayback
 * liveplaybackoff
 * repeat
 * repeatoff
 * series
 * repeatdownload
 * view360
 * view360off
 * info
 * ```
 *
 * @name iconList
 * @memberof moonstone/Icon
 * @constant
 * @type Object
 * @public
 */

const Icon = Pure(
	Skinnable(
		IconBase
	)
);

export default Icon;
export {Icon, IconBase, iconList as icons};
