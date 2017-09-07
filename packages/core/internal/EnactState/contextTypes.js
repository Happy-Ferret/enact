import PropTypes from 'prop-types';

const contextTypes = {
	publish: PropTypes.func,
	subscribe: PropTypes.func,
	unsubscribe: PropTypes.func
};

export default contextTypes;
export {
	contextTypes
};
