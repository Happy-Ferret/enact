import {childrenEquals} from '@enact/core/util';
import hoc from '@enact/core/hoc';
import React from 'react';

const defaultConfig = {
	contextTypes: null,
	contextComparators: {
		'*': (a, b) => a === b
	},
	propComparators: {
		'*': (a, b) => a === b,
		children: childrenEquals
	}
};

const Pure = hoc(defaultConfig, (config, Wrapped) => {
	let {contextComparators, contextTypes, propComparators} = config;
	const hasContext = contextTypes != null;

	if (Array.isArray(contextTypes)) {
		contextTypes = Object.assign({}, ...contextTypes);
	}

	return class extends React.Component {
		static displayName = `Pure(${Wrapped.displayName || Wrapped.name || 'Anonymous'})`

		static contextTypes = contextTypes

		shouldComponentUpdate (nextProps, nextState, nextContext) {
			return (
				hasContext && this.hasChanged(this.context, nextContext, contextComparators) ||
				this.hasChanged(this.props, nextProps, propComparators)
			);
		}

		hasChanged (current, next, comparators) {
			const propKeys = Object.keys(current);
			const nextKeys = Object.keys(next);

			if (propKeys.length !== nextKeys.length) {
				return true;
			}

			const hasOwn = Object.prototype.hasOwnProperty.bind(current);
			for (let i = 0; i < nextKeys.length; i++) {
				const prop = nextKeys[i];
				const comp = comparators[prop] || comparators['*'];
				if (!hasOwn(prop) || !comp(current[prop], next[prop])) {
					return true;
				}
			}

			return false;
		}

		render () {
			return (
				<Wrapped {...this.props} />
			);
		}
	};
});

export default Pure;
export {
	Pure
};
