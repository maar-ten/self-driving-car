class Graph {
    constructor(points = [], segments = []) {
        this.points = points;
        this.segments = segments;
    }

    static load(info) {
        const points = info.points.map(p => new Point(p.x, p.y));
        const segments = info.segments.map(s => new Segment(
                points.find(p => p.equals(s.p1)),
                points.find(p => p.equals(s.p2)),
                s.oneWay
        ));
        return new Graph(points, segments);
    }

    hash() {
        return JSON.stringify(this);
    }
    
    addPoint(point) {
        this.points.push(point);
    }

    containsPoint(point) {
        return this.points.find(p => p.equals(point));
    }

    tryAddPoint(point) {
        if (!this.containsPoint(point)) {
            this.addPoint(point);
            return true;
        }
        return false;
    }

    removePoint(point) {
        const segments = this.getSegmentsWithPoint(point);
        segments.forEach(seg => this.removeSegment(seg));
        this.points.splice(this.points.indexOf(point), 1);
    }

    addSegment(seg) {
        this.segments.push(seg);
    }

    containsSegment(seg) {
        return this.segments.find(s => s.equals(seg));
    }

    tryAddSegment(seg) {
        if (!this.containsSegment(seg) && !seg.p1.equals(seg.p2)) {
            this.addSegment(seg);
            return true;
        }
        return false;
    }

    removeSegment(seg) {
        this.segments.splice(this.segments.indexOf(seg), 1);
    }

    getSegmentsWithPoint(point) {
        return this.segments.filter(seg => seg.includes(point));
    }

    dispose() {
        this.points.length = 0;
        this.segments.length = 0;
    }

    draw(ctx) {
        this.segments.forEach(seg => seg.draw(ctx));
        
        this.points.forEach(point => point.draw(ctx));
    }
}