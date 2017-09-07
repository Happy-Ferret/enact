import hoc from '@enact/core/hoc';
import React from 'react';

import contextTypes from './contextTypes';

const Publisher = hoc({publishProp: 'publish'}, (config, Wrapped) => {
	const {channels, publishProp} = config;

	return class extends React.Component {
		static displayName = 'Publisher'
		static contextTypes = contextTypes
		static childContextTypes = contextTypes

		constructor () {
			super();

			this.listeners = {};
		}

		getChildContext () {
			return {
				publish: this.publish,
				subscribe: this.subscribe,
				unsubscribe: this.unsubscribe
			};
		}

		addListener (channel, listener) {
			const l = this.listeners[channel] = this.listeners[channel] || new Set();
			l.add(listener);
		}

		removeListener (channel, listener) {
			const l = this.listeners[channel];
			if (l) {
				l.remove(listener);
			}
		}

		publish = (channel, message) => {
			if (channels.indexOf(channel) >= 0) {
				const l = this.listeners[channel];
				if (l) {
					for (let listener of l) {
						listener({channel, message});
					}
				}
			} else if (this.context.publish) {
				this.context.publish(channel, message);
			}
		}

		subscribe = (channel, listener) => {
			if (channels.indexOf(channel) >= 0) {
				this.addListener(channel, listener);
			} else if (this.context.subscribe) {
				this.context.subscribe(channel, listener);
			}
		}

		unsubscribe = (channel, listener) => {
			if (channels.indexOf(channel) >= 0) {
				this.removeListener(channel, listener);
			} else if (this.context.unsubscribe) {
				this.context.unsubscribe(channel, listener);
			}
		}

		render () {
			let props = this.props;

			if (publishProp) {
				props = {
					...this.props,
					[publishProp]: this.publish
				};
			}

			return (
				<Wrapped {...props} />
			);
		}
	};
});

export default Publisher;
export {
	Publisher
};
