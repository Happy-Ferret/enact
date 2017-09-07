import React from 'react';
import hoc from '@enact/core/hoc';
import {childrenEquals} from '@enact/core/util';

import contextTypes from './contextTypes';

const strictlyEqual = (a, b) => a === b;

const Subscriber = hoc({pure: true}, (config, Wrapped) => {
	const {channels, pure} = config;

	return class extends React.Component {
		static contextTypes = contextTypes

		constructor () {
			super();

			this.state = {};
		}

		componentDidMount () {
			if (this.context.subscribe) {
				channels.forEach(channel => {
					this.context.subscribe(channel, this.handleSubscription);
				});
			}
		}

		shouldComponentUpdate (nextProps, nextState) {
			if (!pure) return true;

			return (
				this.hasChanged(this.state, nextState) ||
				this.hasChanged(this.props, nextProps, {children: childrenEquals})
			);
		}

		componentWillUnmount () {
			if (this.context.unsubscribe) {
				channels.forEach(channel => {
					this.context.unsubscribe(channel, this.handleSubscription);
				});
			}
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
				const comp = comparators && comparators[prop] || strictlyEqual;
				if (!hasOwn(prop) || !comp(current[prop], next[prop])) {
					return true;
				}
			}

			return false;
		}

		handleSubscription = ({channel, message}) => {
			this.setState(state => {
				return Object.keys(message).reduce((result, param) => {
					const key = `${channel}-${param}`;
					if (state[key] !== message[param]) {
						result = result || {};
						result[key] = message[param];
					}

					return result;
				}, null);
			});
		}

		render () {
			return (
				<Wrapped {...this.props} {...this.state} />
			);
		}
	};
});

export default Subscriber;
export {
	Subscriber
};
