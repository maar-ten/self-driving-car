class StopEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = this.viewport.canvas;
        this.ctx = this.canvas.getContext('2d');

        this.intent = null;
        this.mouse = null;

        this.eventListeners = [
            { event: 'mousedown', fn: this.#handleMouseDown.bind(this) },
            { event: 'mousemove', fn: this.#handleMouseMove.bind(this) },
            { event: 'contextmenu', fn: evt => evt.preventDefault() },
        ];
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
        const seg = getNearestSegment(this.mouse, this.world.graph.segments, 10 * this.viewport.zoom);
        if (seg) {
            const proj = seg.projectPoint(this.mouse);
            if (proj.offset >= 0 && proj.offset <= 1) {
                this.intent = new Stop(
                    proj.point,
                    seg.directionVector(),
                    world.roadWidth,
                    world.roadWidth / 2
                );
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        }
    }

    #handleMouseDown(evt) {

    }

    display() {
        if (this.intent) {
            this.intent.draw(this.ctx);
        }
    }
}