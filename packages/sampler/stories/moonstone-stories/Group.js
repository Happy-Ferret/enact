import Button from '@enact/moonstone/Button';
import Group, {GroupBase} from '@enact/ui/Group';
import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {withKnobs} from '@kadira/storybook-addon-knobs';

Group.propTypes = Object.assign({}, GroupBase.propTypes, Group.propTypes);
Group.defaultProps = Object.assign({}, GroupBase.defaultProps, Group.defaultProps);
Group.displayName = 'Group';

const groupData = ['One', 'Two', 'Three'];

storiesOf('Group')
	.addDecorator(withKnobs)
	.addWithInfo(
		' ',
		'The basic Group',
		() => (
			<Group
				childComponent={Button}
				onActivate={action('onActivate')}
			>
				{groupData}
			</Group>
		)
	);
