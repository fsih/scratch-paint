import paper from '@scratch/paper';
import Modes from '../../lib/modes';
import {convertToBitmap, drawRotatedEllipse, drawShearedEllipse} from '../bitmap';
import {getRaster} from '../layer';
import {clearSelection} from '../selection';
import BoundingBoxTool from '../selection-tools/bounding-box-tool';
import NudgeTool from '../selection-tools/nudge-tool';

/**
 * Tool for drawing ovals.
 */
class OvalTool extends paper.Tool {
    static get TOLERANCE () {
        return 6;
    }
    /**
     * @param {function} setSelectedItems Callback to set the set of selected items in the Redux state
     * @param {function} clearSelectedItems Callback to clear the set of selected items in the Redux state
     * @param {!function} onUpdateImage A callback to call when the image visibly changes
     */
    constructor (setSelectedItems, clearSelectedItems, onUpdateImage) {
        super();
        this.setSelectedItems = setSelectedItems;
        this.clearSelectedItems = clearSelectedItems;
        this.onUpdateImage = onUpdateImage;
        this.boundingBoxTool = new BoundingBoxTool(Modes.BIT_OVAL, setSelectedItems, clearSelectedItems, onUpdateImage);
        const nudgeTool = new NudgeTool(this.boundingBoxTool, onUpdateImage);
        
        // We have to set these functions instead of just declaring them because
        // paper.js tools hook up the listeners in the setter functions.
        this.onMouseDown = this.handleMouseDown;
        this.onMouseDrag = this.handleMouseDrag;
        this.onMouseUp = this.handleMouseUp;
        this.onKeyUp = nudgeTool.onKeyUp;
        this.onKeyDown = nudgeTool.onKeyDown;

        this.oval = null;
        this.color = null;
        this.active = false;
    }
    getHitOptions () {
        return {
            segments: false,
            stroke: true,
            curves: false,
            fill: true,
            guide: false,
            match: hitResult =>
                (hitResult.item.data && hitResult.item.data.isHelperItem) ||
                    hitResult.item === this.oval, // Allow hits on bounding box and oval only
            tolerance: OvalTool.TOLERANCE / paper.view.zoom
        };
    }
    /**
     * Should be called if the selection changes to update the bounds of the bounding box.
     * @param {Array<paper.Item>} selectedItems Array of selected items.
     */
    onSelectionChanged (selectedItems) {
        this.boundingBoxTool.onSelectionChanged(selectedItems);
    }
    setColor (color) {
        this.color = color;
    }
    handleMouseDown (event) {
        if (event.event.button > 0) return; // only first mouse button
        this.active = true;

        if (this.boundingBoxTool.onMouseDown(event, false /* clone */, false /* multiselect */, this.getHitOptions())) {
            this.isBoundingBoxMode = true;
        } else {
            this.isBoundingBoxMode = false;
            clearSelection(this.clearSelectedItems);
            this.commitOval();
            this.oval = new paper.Shape.Ellipse({
                fillColor: this.color,
                point: event.downPoint,
                size: 0
            });
        }
    }
    handleMouseDrag (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button

        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseDrag(event);
            return;
        }

        const downPoint = new paper.Point(event.downPoint.x, event.downPoint.y);
        const point = new paper.Point(event.point.x, event.point.y);
        if (event.modifiers.shift) {
            this.oval.size = new paper.Point(event.downPoint.x - event.point.x, event.downPoint.x - event.point.x);
        } else {
            this.oval.size = downPoint.subtract(point);
        }
        if (event.modifiers.alt) {
            this.oval.position = downPoint;
        } else {
            this.oval.position = downPoint.subtract(this.oval.size.multiply(0.5));
        }
        
    }
    handleMouseUp (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button
        
        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseUp(event);
            this.isBoundingBoxMode = null;
            return;
        }

        if (this.oval) {
            if (Math.abs(this.oval.size.width * this.oval.size.height) < OvalTool.TOLERANCE / paper.view.zoom) {
                // Tiny oval created unintentionally?
                this.oval.remove();
                this.oval = null;
            } else {
                // Hit testing does not work correctly unless the width and height are positive
                this.oval.size = new paper.Point(Math.abs(this.oval.size.width), Math.abs(this.oval.size.height));
                this.oval.selected = true;
                this.setSelectedItems();
            }
        }
        this.active = false;
    }
    commitOval () {
        if (this.oval) {
            const decomposed = this.oval.matrix.decompose();
            const a = this.oval.matrix.a;
            const b = this.oval.matrix.b;
            const c = this.oval.matrix.c;
            const d = this.oval.matrix.d;
            const context = getRaster().getContext('2d');
            context.fillStyle = this.color;
            if (Math.abs(decomposed.skewing.x) < 1) {
                console.log('using rotation');
                drawRotatedEllipse({
                    centerX: this.oval.position.x,
                    centerY: this.oval.position.y,
                    radiusX: Math.abs(this.oval.size.width * decomposed.scaling.x / 2),
                    radiusY: Math.abs(this.oval.size.height * decomposed.scaling.y / 2),
                    rotation: -decomposed.rotation * Math.PI / 180,
                    isFilled: true
                }, context);
            } else if (Math.abs(decomposed.rotation) < 1 && (c || d)) {
                console.log('using skewing');
                console.log(((a * c) + (b * d)) / ((c * c) + (d * d)));
                drawShearedEllipse({
                    centerX: this.oval.position.x,
                    centerY: this.oval.position.y,
                    radiusX: Math.abs(this.oval.size.width * decomposed.scaling.x / 2),
                    radiusY: Math.abs(this.oval.size.height * decomposed.scaling.y / 2),
                    shearSlope: -((a * c) + (b * d)) / ((c * c) + (d * d)),
                    isFilled: true
                }, context);
            } else {
                console.log('using neither');
                // @todo our draw ellipse algorithm can't handle both rotation and skewing
                convertToBitmap(this.clearSelectedItems, this.onUpdateImage);
            }
            console.log(decomposed);
            this.oval.remove();
            this.oval = null;
            this.onUpdateImage();
        }

    }
    deactivateTool () {
        this.commitOval();
        this.boundingBoxTool.removeBoundsPath();
    }
}

export default OvalTool;
