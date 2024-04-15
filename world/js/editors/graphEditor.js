class GraphEditor {
    constructor(viewport, graph) {
        this.viewport = viewport;
        this.canvas = viewport.canvas;
        this.graph = graph;

        this.ctx = this.canvas.getContext('2d');

        this.start = null;
        this.end = null;
        this.selected = null;
        this.hovered = null;
        this.dragging = false;
        this.mouse = null;
        this.eventListeners = [
            { event: 'mousedown', fn: this.#handleMouseDown.bind(this) },
            { event: 'mousemove', fn: this.#handleMouseMove.bind(this) },
            { event: 'mouseup', fn: () => this.dragging = false },
            { event: 'contextmenu', fn: evt => evt.preventDefault() },
        ];
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
        this.selected = false;
        this.hovered = false;
    }

    #addEventListeners() {
        this.eventListeners.forEach(el => this.canvas.addEventListener(el.event, el.fn));
        window.addEventListener('keydown', e => {
            if (this.hovered) {
                if (e.key === 's') {
                    this.start = this.hovered;
                } else if (e.key === 'e') {
                    this.end = this.hovered;
                }
            }
        })
    }

    #removeEventListeners() {
        this.eventListeners.forEach(el => this.canvas.removeEventListener(el.event, el.fn));
    }

    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10 * this.viewport.zoom);
        if (this.dragging) {
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }

    #handleMouseDown(evt) {
        if (evt.button === 2) { // right click
            if (this.selected) {
                this.selected = null;
            }
            else if (this.hovered) {
                this.#removePoint(this.hovered);
            }
        }
        if (evt.button === 0) { // left click
            if (this.hovered) {
                this.#selectPoint(this.hovered);
                this.dragging = true;
                return;
            }
            this.graph.addPoint(this.mouse);
            this.#selectPoint(this.mouse);
            this.hovered = this.mouse;
        }
    }

    #selectPoint(point) {
        if (this.selected) {
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }

    #removePoint(point) {
        this.graph.removePoint(point);
        this.hovered = null;
        if (this.selected === point) {
            this.selected = null;
        }
    }

    dispose() {
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }

    display() {
        this.graph.draw(this.ctx);
        if (this.hovered) {
            this.hovered.draw(this.ctx, { fill: true });
        }
        if (this.selected) {
            const intent = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(ctx, { dash: [3, 3] });
            this.selected.draw(this.ctx, {
                outline: true,
                fill: this.selected === this.hovered
            });

        }

        if (this.start && this.end) {
            const path = this.graph.getShortestPath(this.start, this.end);
            path.forEach(p => {
                p.draw(this.ctx, {size: 50, color: 'blue'})
                if (p.prev) {
                    new Segment(p, p.prev).draw(this.ctx, { width: 20 });
                }
            });
        }
    }
}