import hoc from '@enact/core/hoc';
import {contextTypes as i18nContextTypes} from '@enact/i18n/I18nDecorator';
import {contextTypes as remeasureContextTypes} from '@enact/ui/Remeasurable';
import {contextTypes as skinContextTypes} from '@enact/ui/Skinnable';
import UiPure from '@enact/ui/internal/Pure';

const defaultConfig = {
	contextTypes: [
		i18nContextTypes,
		remeasureContextTypes,
		skinContextTypes
	]
};

const Pure = hoc(defaultConfig, UiPure);

export default Pure;
export {
	Pure
};
