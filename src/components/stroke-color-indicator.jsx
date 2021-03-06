import React from 'react';
import PropTypes from 'prop-types';

import {defineMessages, injectIntl, intlShape} from 'react-intl';
import BufferedInputHOC from './forms/buffered-input-hoc.jsx';
import Label from './forms/label.jsx';
import Input from './forms/input.jsx';

import {MIXED} from '../helper/style-path';

import styles from './paint-editor.css';

const BufferedInput = BufferedInputHOC(Input);
const messages = defineMessages({
    stroke: {
        id: 'paint.paintEditor.stroke',
        description: 'Label for the color picker for the outline color',
        defaultMessage: 'Outline'
    }
});
const StrokeColorIndicatorComponent = props => (
    <div className={styles.inputGroup}>
        <Label text={props.intl.formatMessage(messages.stroke)}>
            <BufferedInput
                type="text"
                // @todo Don't use text
                value={props.strokeColor === MIXED ? 'mixed' :
                    props.strokeColor === null ? 'transparent' : props.strokeColor}
                onSubmit={props.onChangeStrokeColor}
            />
        </Label>
    </div>
);

StrokeColorIndicatorComponent.propTypes = {
    intl: intlShape,
    onChangeStrokeColor: PropTypes.func.isRequired,
    strokeColor: PropTypes.string
};

export default injectIntl(StrokeColorIndicatorComponent);
