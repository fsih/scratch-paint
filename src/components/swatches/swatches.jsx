import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './swatches.css';

import eyeDropperIcon from '../color-picker/icons/eye-dropper.svg';
import noFillIcon from '../color-button/no-fill.svg';
import {getColorName, getColorHex} from '../../lib/colors';

const SwatchesComponent = props => {
    const swatchClickFactory = color =>
        () => props.onSwatch(color);

    const colorToSwatchMap = color => {
        const colorHex = getColorHex(color);
        const colorsMatch = props.colorMatchesActiveColor(colorHex);
        return (<div
            key={color}
            role="img"
            alt={getColorName(color)}
            title={getColorName(color)}
            className={classNames({
                [styles.swatch]: true,
                [styles.smallSwatch]: props.small,
                [styles.activeSwatch]: colorsMatch,
                [styles.smallActiveSwatch]: colorsMatch && props.small
            })}
            style={{
                backgroundColor: colorHex
            }}
            onClick={swatchClickFactory(colorHex)}
        />
        );
    };

    const isTransparent = () =>
        (props.colorIndex === 0 && props.color === null) ||
        (props.colorIndex === 1 && props.color2 === null);

    return (
        <div className={props.containerStyle || ''} >
            <div className={styles.swatchRow}>
                <div
                    className={classNames({
                        [styles.clickable]: true,
                        [styles.swatch]: true,
                        [styles.smallSwatch]: props.small,
                        [styles.activeSwatch]: isTransparent(),
                        [styles.smallActiveSwatch]: isTransparent() && props.small
                    })}
                    onClick={props.onTransparent}
                >
                    <img
                        className={classNames({
                            [styles.swatchIcon]: true,
                            [styles.smallSwatchIcon]: props.small
                        })}
                        draggable={false}
                        src={noFillIcon}
                    />
                </div>
                {props.row1Colors ? props.row1Colors.map(colorToSwatchMap) : null}
            </div>
            <div className={styles.swatchRow}>
                <div
                    className={classNames({
                        [styles.clickable]: true,
                        [styles.swatch]: true,
                        [styles.smallSwatch]: props.small,
                        [styles.activeSwatch]: props.isEyeDropping,
                        [styles.smallActiveSwatch]: props.isEyeDropping && props.small
                    })}
                    onClick={props.onActivateEyeDropper}
                >
                    <img
                        className={classNames({
                            [styles.swatchIcon]: true,
                            [styles.smallSwatchIcon]: props.small
                        })}
                        draggable={false}
                        src={eyeDropperIcon}
                    />
                </div>
                {props.row2Colors ? props.row2Colors.map(colorToSwatchMap) : null}
            </div>
        </div>
    );
};

SwatchesComponent.propTypes = {
    onActivateEyeDropper: PropTypes.func.isRequired,
    onSwatch: PropTypes.func.isRequired,
    onTransparent: PropTypes.func.isRequired,
    color: PropTypes.string,
    color2: PropTypes.string,
    colorIndex: PropTypes.number.isRequired,
    colorMatchesActiveColor: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    containerStyle: PropTypes.string,
    isEyeDropping: PropTypes.bool.isRequired,
    small: PropTypes.bool,
    row1Colors: PropTypes.arrayOf(PropTypes.string),
    row2Colors: PropTypes.arrayOf(PropTypes.string)
};

SwatchesComponent.defaultProps = {
    small: false
};
export default SwatchesComponent;
