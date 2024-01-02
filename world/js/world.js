class World {
    constructor(
        graph,
        roadWidth = 100,
        roadRoundness = 10,
        buildingWidth = 150,
        buildingMinLength = 150,
        spacing = 50,
        treeSize = 160
    ) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;
        this.treeSize = treeSize;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = [];
        this.laneGuides = [];

        this.markings = [];

        this.cars = [];
        this.bestCar = undefined;

        this.frameCount = 0;

        // this.generate();
    }

    static load(info) {
        const world = new World(new Graph());
        world.graph = Graph.load(info.graph);
        world.roadWidth = info.roadWidth;
        world.roadRoundness = info.roadRoundness;
        world.buildingWidth = info.buildingWidth;
        world.buildingMinLength = info.buildingMinLength;
        world.spacing = info.spacing;
        world.treeSize = info.treeSize;

        world.envelopes = info.envelopes.map(e => Envelop.load(e));
        world.roadBorders = info.roadBorders.map(b => new Segment(b.p1, b.p2));
        world.buildings = info.buildings.map(b => Building.load(b));
        world.trees = info.trees.map(t => new Tree(t.center, t.size, t.height));
        world.laneGuides = info.laneGuides.map(g => new Segment(g.p1, g.p2));

        world.markings = info.markings.map(m => Marking.load(m));

        world.zoom = info.zoom;
        world.offset = info.offset;

        return world;
    }

    generate() {
        this.envelopes.length = 0;
        this.envelopes = this.graph.segments.map(s => new Envelop(s, this.roadWidth, this.roadRoundness));
        this.roadBorders = Polygon.union(this.envelopes.map(e => e.poly));
        this.buildings = this.#generateBuildings();
        this.trees = this.#generateTrees();
        this.laneGuides = this.#generateLaneGuides();
    }

    #generateLaneGuides() {
        const tmpEnvelopes = this.graph.segments.map(seg => new Envelop(
            seg,
            this.roadWidth / 2,
            this.roadRoundness
        ));

        const guides = Polygon.union(tmpEnvelopes.map(e => e.poly));
        return guides;
    }

    #generateTrees() {
        const points = this.roadBorders
            .flatMap(s => [s.p1, s.p2])
            .concat(this.buildings.flatMap(b => b.base.points));
        const left = Math.min(...points.map(p => p.x));
        const right = Math.max(...points.map(p => p.x));
        const top = Math.min(...points.map(p => p.y));
        const bottom = Math.max(...points.map(p => p.y));

        const illegalPolys = [
            ...this.buildings.map(b => b.base),
            ...this.envelopes.map(e => e.poly),
        ];

        const trees = [];
        let tryCount = 0;
        while (tryCount < 100) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(bottom, top, Math.random())
            );

            if (
                !trees.some(t => distance(t.center, p) < this.treeSize) && // no overlap with other trees
                !illegalPolys.some(poly => poly.containsPoint(p)) &&  // not inside other polygons
                !illegalPolys.some(poly => poly.distanceToPoint(p) < this.treeSize / 2) && // save distance away from other polygons
                illegalPolys.some(poly => poly.distanceToPoint(p) < this.treeSize * 2) // not too far away from other polygons
            ) {
                trees.push(new Tree(p, this.treeSize));
                tryCount = 0;
            }
            tryCount++;
        }
        return trees;
    }

    #generateBuildings() {
        const tmpEnvelopes = this.graph.segments.map(seg => new Envelop(
            seg,
            this.roadWidth + this.buildingWidth + this.spacing * 2,
            this.roadRoundness
        ));

        const guides = Polygon
            .union(tmpEnvelopes.map(e => e.poly))
            .filter(seg => seg.length() >= this.buildingMinLength);

        const supports = guides.flatMap(seg => {
            const len = seg.length() + this.spacing;
            const buildingCount = Math.floor(len / (this.buildingMinLength + this.spacing));
            const buildingLength = len / buildingCount - this.spacing;
            const dir = seg.directionVector();

            return Array.from(Array(buildingCount)).reduce((acc, _, index) => {
                let q1, q2;
                if (index === 0) {
                    q1 = seg.p1;
                    q2 = add(q1, scale(dir, buildingLength));
                } else {
                    const prev = acc[acc.length - 1];
                    q1 = add(prev.p2, scale(dir, this.spacing));
                    q2 = add(q1, scale(dir, buildingLength));
                }
                return [...acc, new Segment(q1, q2)];
            }, []);
        });

        const bases = supports
            .map(seg => new Envelop(seg, this.buildingWidth).poly);

        const eps = .001;

        for (let i = 0; i < bases.length - 1; i++) {
            for (let j = i + 1; j < bases.length; j++) {
                if (
                    bases[i].intersectsPoly(bases[j]) ||
                    bases[i].distanceToPoly(bases[j]) < this.spacing - eps
                ) {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }

        return bases.map(b => new Building(b));
    }

    #getIntersections() {
        const subset = [];
        for (const point of this.graph.points) {
            let degree = 0;
            for (const seg of this.graph.segments) {
                if (seg.includes(point)) {
                    degree++;
                }
            }

            if (degree > 2) {
                subset.push(point);
            }
        }
        return subset;
    }

    #updateLights() {
        const lights = this.markings.filter((m) => m instanceof Light);
        const controlCenters = [];
        for (const light of lights) {
            const point = getNearestPoint(light.center, this.#getIntersections());
            let controlCenter = controlCenters.find((c) => c.equals(point));
            if (!controlCenter) {
                controlCenter = new Point(point.x, point.y);
                controlCenter.lights = [light];
                controlCenters.push(controlCenter);
            } else {
                controlCenter.lights.push(light);
            }
        }
        const greenDuration = 2,
            yellowDuration = 1;
        for (const center of controlCenters) {
            center.ticks = center.lights.length * (greenDuration + yellowDuration);
        }
        const tick = Math.floor(this.frameCount / 60);
        for (const center of controlCenters) {
            const cTick = tick % center.ticks;
            const greenYellowIndex = Math.floor(
                cTick / (greenDuration + yellowDuration)
            );
            const greenYellowState =
                cTick % (greenDuration + yellowDuration) < greenDuration
                    ? 'green'
                    : 'yellow';
            for (let i = 0; i < center.lights.length; i++) {
                if (i == greenYellowIndex) {
                    center.lights[i].state = greenYellowState;
                } else {
                    center.lights[i].state = 'red';
                }
            }
        }
        this.frameCount++;
    }

    draw(ctx, viewPoint, showStartMarkings = true, renderRadius = 1000) {
        this.#updateLights();

        this.envelopes.forEach(e => e.draw(ctx, { stroke: '#bbb', fill: '#bbb', lineWidth: 15 }));
        this.markings.filter(m => m.type !== 'start' || showStartMarkings)
            .forEach(m => m.draw(ctx));
        this.graph.segments.forEach(s => s.draw(ctx, { color: 'white', width: 4, dash: [10, 10] }));
        this.roadBorders.forEach(r => r.draw(ctx, { color: 'white', width: 5 }));

        ctx.globalAlpha = .2;
        this.cars.forEach(c => c.draw(ctx));
        ctx.globalAlpha = 1;
        if (this.bestCar) {
            this.bestCar.draw(ctx, true);
        }

        this.buildings
            .concat(this.trees)
            .filter(i => i.base.distanceToPoint(viewPoint) < renderRadius)
            .sort((a, b) =>
                b.base.distanceToPoint(viewPoint) -
                a.base.distanceToPoint(viewPoint)
            )
            .forEach(i => i.draw(ctx, viewPoint));
    }
}