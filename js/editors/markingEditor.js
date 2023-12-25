class MarkingEditor {
    constructor(viewport, world, targetSegments) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = this.viewport.canvas;
        this.ctx = this.canvas.getContext('2d');

        this.intent = null;
        this.mouse = null;

        this.targetSegments = targetSegments;

        this.markings = world.markings;

        this.eventListeners = [
            { event: 'mousedown', fn: this.#handleMouseDown.bind(this) },
            { event: 'mousemove', fn: this.#handleMouseMove.bind(this) },
            { event: 'contextmenu', fn: evt => evt.preventDefault() },
        ];
    }

    // to be overwritten
    createMarking(center, directionVector) {
        return center;
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
    }

    #addEventListeners() {
        this.eventListeners.forEach(el => this.canvas.addEventListener(el.event, el.fn));
    }

    #removeEventListeners() {
        this.eventListeners.forEach(el => this.canvas.removeEventListener(el.event, el.fn));
    }

    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true);
        const seg = getNearestSegment(
            this.mouse, 
            this.targetSegments,
            10 * this.viewport.zoom);
        if (seg) {
            const proj = seg.projectPoint(this.mouse);
            if (proj.offset >= 0 && proj.offset <= 1) {
                this.intent = this.createMarking(proj.point, seg.directionVector());
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        }
    }

    #handleMouseDown(evt) {
        if (evt.button == 0) { // left click
            if (this.intent) {
                this.markings.push(this.intent);
                this.intent = null;
            }
        }
        if (evt.button == 2) { // right click
            const index = this.markings.findIndex((m) => m.poly.containsPoint(this.mouse));
            if (index != -1) {
                this.markings.splice(index, 1);
            }
        }
    }

    display() {
        if (this.intent) {
            this.intent.draw(this.ctx);
        }
    }
}