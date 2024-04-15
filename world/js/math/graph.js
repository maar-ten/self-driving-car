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

    getSegmentsLeavingFromPoint(point) {
        const segments = this.getSegmentsWithPoint(point);
        return segments.filter(seg => !seg.oneWay || seg.p1.equals(point));
    }

    getShortestPath(start, end) {
        this.points.forEach(p => {
            p.dist = Number.MAX_SAFE_INTEGER;
            p.visited = false;
        });

        let currentPoint = start;
        currentPoint.dist = 0;

        while (!end.visited) {
            const segs = this.getSegmentsLeavingFromPoint(currentPoint);
            segs.forEach(s => {
                const otherPoint = s.p1.equals(currentPoint) ? s.p2 : s.p1;
                if (currentPoint.dist + s.length() < otherPoint.dist) {
                    otherPoint.dist = currentPoint.dist + s.length();
                    otherPoint.prev = currentPoint;
                }
            });
            currentPoint.visited = true;

            const unvisited = this.points.filter(p => !p.visited);
            const dists = unvisited.map(p => p.dist)
            currentPoint = unvisited.find(p => p.dist === Math.min(...dists));
        }

        const path = [];
        currentPoint = end;
        while (currentPoint) {
            path.unshift(currentPoint);
            currentPoint = currentPoint.prev;
        }

        // remove temporary data properties
        this.points.forEach(p => {
            delete p.dist;
            delete p.visited;
            delete p.prev;
        });

        return path.reverse();
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