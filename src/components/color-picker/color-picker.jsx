import React from 'react';
import PropTypes from 'prop-types';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import classNames from 'classnames';
import parseColor from 'parse-color';

import Slider from '../forms/slider.jsx';
import LabeledIconButton from '../labeled-icon-button/labeled-icon-button.jsx';
import styles from './color-picker.css';
import GradientTypes from '../../lib/gradient-types';
import {MIXED} from '../../helper/style-path';

import eyeDropperIcon from './icons/eye-dropper.svg';
import noFillIcon from '../color-button/no-fill.svg';
import mixedFillIcon from '../color-button/mixed-fill.svg';
import fillHorzGradientIcon from './icons/fill-horz-gradient-enabled.svg';
import fillRadialIcon from './icons/fill-radial-enabled.svg';
import fillSolidIcon from './icons/fill-solid-enabled.svg';
import fillVertGradientIcon from './icons/fill-vert-gradient-enabled.svg';
import swapIcon from './icons/swap.svg';
import {getColorName, getColorRGB} from '../../lib/colors';

const hsvToHex = (h, s, v) =>
    // Scale hue back up to [0, 360] from [0, 100]
    parseColor(`hsv(${3.6 * h}, ${s}, ${v})`).hex
;

const messages = defineMessages({
    swap: {
        defaultMessage: 'Swap',
        description: 'Label for button that swaps the two colors in a gradient',
        id: 'paint.colorPicker.swap'
    }
});
class ColorPickerComponent extends React.Component {
    _makeBackground (channel) {
        const stops = [];
        // Generate the color slider background CSS gradients by adding
        // color stops depending on the slider.
        for (let n = 100; n >= 0; n -= 10) {
            switch (channel) {
            case 'hue':
                stops.push(hsvToHex(n, this.props.saturation, this.props.brightness));
                break;
            case 'saturation':
                stops.push(hsvToHex(this.props.hue, n, this.props.brightness));
                break;
            case 'brightness':
                stops.push(hsvToHex(this.props.hue, this.props.saturation, n));
                break;
            default:
                throw new Error(`Unknown channel for color sliders: ${channel}`);
            }
        }
        return `linear-gradient(to left, ${stops.join(',')})`;
    }
    render () {
        const swatchClickFactory = color =>
            () => this.props.onSwatch(color);
        return (
            <div
                className={styles.colorPickerContainer}
                dir={this.props.rtl ? 'rtl' : 'ltr'}
            >
                {this.props.shouldShowGradientTools ? (
                    <div>
                        <div className={styles.row}>
                            <div className={styles.gradientPickerRow}>
                                <img
                                    className={classNames({
                                        [styles.inactiveGradient]: this.props.gradientType !== GradientTypes.SOLID,
                                        [styles.clickable]: true
                                    })}
                                    draggable={false}
                                    src={fillSolidIcon}
                                    onClick={this.props.onChangeGradientTypeSolid}
                                />
                                <img
                                    className={classNames({
                                        [styles.inactiveGradient]:
                                            this.props.gradientType !== GradientTypes.HORIZONTAL,
                                        [styles.clickable]: true
                                    })}
                                    draggable={false}
                                    src={fillHorzGradientIcon}
                                    onClick={this.props.onChangeGradientTypeHorizontal}
                                />
                                <img
                                    className={classNames({
                                        [styles.inactiveGradient]: this.props.gradientType !== GradientTypes.VERTICAL,
                                        [styles.clickable]: true
                                    })}
                                    draggable={false}
                                    src={fillVertGradientIcon}
                                    onClick={this.props.onChangeGradientTypeVertical}
                                />
                                <img
                                    className={classNames({
                                        [styles.inactiveGradient]: this.props.gradientType !== GradientTypes.RADIAL,
                                        [styles.clickable]: true
                                    })}
                                    draggable={false}
                                    src={fillRadialIcon}
                                    onClick={this.props.onChangeGradientTypeRadial}
                                />
                            </div>
                        </div>
                        <div className={styles.divider} />
                        {this.props.gradientType === GradientTypes.SOLID ? null : (
                            <div className={styles.row}>
                                <div
                                    className={classNames(
                                        styles.gradientPickerRow,
                                        styles.gradientSwatchesRow
                                    )}
                                >
                                    <div
                                        className={classNames({
                                            [styles.clickable]: true,
                                            [styles.swatch]: true,
                                            [styles.largeSwatch]: true,
                                            [styles.activeSwatch]: this.props.colorIndex === 0
                                        })}
                                        style={{
                                            backgroundColor: this.props.color === null || this.props.color === MIXED ?
                                                'white' : this.props.color
                                        }}
                                        onClick={this.props.onSelectColor}
                                    >
                                        {this.props.color === null ? (
                                            <img
                                                className={styles.largeSwatchIcon}
                                                draggable={false}
                                                src={noFillIcon}
                                            />
                                        ) : this.props.color === MIXED ? (
                                            <img
                                                className={styles.largeSwatchIcon}
                                                draggable={false}
                                                src={mixedFillIcon}
                                            />
                                        ) : null}
                                    </div>
                                    <LabeledIconButton
                                        className={styles.swapButton}
                                        imgSrc={swapIcon}
                                        title={this.props.intl.formatMessage(messages.swap)}
                                        onClick={this.props.onSwap}
                                    />
                                    <div
                                        className={classNames({
                                            [styles.clickable]: true,
                                            [styles.swatch]: true,
                                            [styles.largeSwatch]: true,
                                            [styles.activeSwatch]: this.props.colorIndex === 1
                                        })}
                                        style={{
                                            backgroundColor: this.props.color2 === null || this.props.color2 === MIXED ?
                                                'white' : this.props.color2
                                        }}
                                        onClick={this.props.onSelectColor2}
                                    >
                                        {this.props.color2 === null ? (
                                            <img
                                                className={styles.largeSwatchIcon}
                                                draggable={false}
                                                src={noFillIcon}
                                            />
                                        ) : this.props.color2 === MIXED ? (
                                            <img
                                                className={styles.largeSwatchIcon}
                                                draggable={false}
                                                src={mixedFillIcon}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
                <div className={styles.colorSwatchesContainer}>
                    <div className={styles.swatchRow}>
                        <div
                            className={classNames({
                                [styles.clickable]: true,
                                [styles.swatch]: true,
                                [styles.activeSwatch]:
                                    (this.props.colorIndex === 0 && this.props.color === null) ||
                                    (this.props.colorIndex === 1 && this.props.color2 === null)
                            })}
                            onClick={this.props.onTransparent}
                        >
                            <img
                                className={styles.swatchIcon}
                                draggable={false}
                                src={noFillIcon}
                            />
                        </div>
                        {this.props.row1Colors ?
                            this.props.row1Colors.map(color => {
                                const activeColor = this.props.colorIndex ? this.props.color2 : this.props.color;
                                return (<div
                                    key={color}
                                    role="img"
                                    alt={getColorName(color)}
                                    title={getColorName(color)}
                                    className={classNames({
                                        [styles.swatch]: true,
                                        [styles.activeSwatch]: this.props.colorsMatch(activeColor, getColorRGB(color))
                                    })}
                                    style={{
                                        backgroundColor: parseColor(getColorRGB(color)).hex
                                    }}
                                    onClick={swatchClickFactory(getColorRGB(color))}
                                />
                                );
                            }) : null}
                    </div>
                    <div className={styles.swatchRow}>
                        <div
                            className={classNames({
                                [styles.clickable]: true,
                                [styles.swatch]: true,
                                [styles.activeSwatch]: this.props.isEyeDropping
                            })}
                            onClick={this.props.onActivateEyeDropper}
                        >
                            <img
                                className={styles.swatchIcon}
                                draggable={false}
                                src={eyeDropperIcon}
                            />
                        </div>
                        {this.props.row2Colors ?
                            this.props.row2Colors.map(color => {
                                const activeColor = this.props.colorIndex ? this.props.color2 : this.props.color;
                                return (<div
                                    key={color}
                                    role="img"
                                    alt={getColorName(color)}
                                    title={getColorName(color)}
                                    className={classNames({
                                        [styles.swatch]: true,
                                        [styles.activeSwatch]: this.props.colorsMatch(activeColor, getColorRGB(color))
                                    })}
                                    style={{
                                        backgroundColor: parseColor(getColorRGB(color)).hex
                                    }}
                                    onClick={swatchClickFactory(getColorRGB(color))}
                                />
                                );
                            }) : null}
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.rowHeader}>
                        <span className={styles.labelName}>
                            <FormattedMessage
                                defaultMessage="Color"
                                description="Label for the hue component in the color picker"
                                id="paint.paintEditor.hue"
                            />
                        </span>
                        <span className={styles.labelReadout}>
                            {Math.round(this.props.hue)}
                        </span>
                    </div>
                    <div className={styles.rowSlider}>
                        <Slider
                            background={this._makeBackground('hue')}
                            value={this.props.hue}
                            onChange={this.props.onHueChange}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.rowHeader}>
                        <span className={styles.labelName}>
                            <FormattedMessage
                                defaultMessage="Saturation"
                                description="Label for the saturation component in the color picker"
                                id="paint.paintEditor.saturation"
                            />
                        </span>
                        <span className={styles.labelReadout}>
                            {Math.round(this.props.saturation)}
                        </span>
                    </div>
                    <div className={styles.rowSlider}>
                        <Slider
                            background={this._makeBackground('saturation')}
                            value={this.props.saturation}
                            onChange={this.props.onSaturationChange}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.rowHeader}>
                        <span className={styles.labelName}>
                            <FormattedMessage
                                defaultMessage="Brightness"
                                description="Label for the brightness component in the color picker"
                                id="paint.paintEditor.brightness"
                            />
                        </span>
                        <span className={styles.labelReadout}>
                            {Math.round(this.props.brightness)}
                        </span>
                    </div>
                    <div className={styles.rowSlider}>
                        <Slider
                            background={this._makeBackground('brightness')}
                            value={this.props.brightness}
                            onChange={this.props.onBrightnessChange}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

ColorPickerComponent.propTypes = {
    brightness: PropTypes.number.isRequired,
    color: PropTypes.string,
    color2: PropTypes.string,
    colorsMatch: PropTypes.func.isRequired,
    colorIndex: PropTypes.number.isRequired,
    gradientType: PropTypes.oneOf(Object.keys(GradientTypes)).isRequired,
    hue: PropTypes.number.isRequired,
    intl: intlShape.isRequired,
    isEyeDropping: PropTypes.bool.isRequired,
    onActivateEyeDropper: PropTypes.func.isRequired,
    onBrightnessChange: PropTypes.func.isRequired,
    onChangeGradientTypeHorizontal: PropTypes.func.isRequired,
    onChangeGradientTypeRadial: PropTypes.func.isRequired,
    onChangeGradientTypeSolid: PropTypes.func.isRequired,
    onChangeGradientTypeVertical: PropTypes.func.isRequired,
    onHueChange: PropTypes.func.isRequired,
    onSaturationChange: PropTypes.func.isRequired,
    onSelectColor: PropTypes.func.isRequired,
    onSelectColor2: PropTypes.func.isRequired,
    onSwap: PropTypes.func,
    onSwatch: PropTypes.func.isRequired,
    onTransparent: PropTypes.func.isRequired,
    row1Colors: PropTypes.arrayOf(PropTypes.string),
    row2Colors: PropTypes.arrayOf(PropTypes.string),
    rtl: PropTypes.bool.isRequired,
    saturation: PropTypes.number.isRequired,
    shouldShowGradientTools: PropTypes.bool.isRequired
};

export default injectIntl(ColorPickerComponent);
