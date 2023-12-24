class World {
    constructor(
        graph,
        roadWidth = 100,
        roadRoundness = 10,
        buildingWidth = 150,
        buildingMinLength = 150,
        spacing = 50
    ) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];

        this.generate();
    }

    generate() {
        this.envelopes.length = 0;
        this.envelopes = this.graph.segments.map(s => new Envelop(s, this.roadWidth, this.roadRoundness));
        this.roadBorders = Polygon.union(this.envelopes.map(e => e.poly));
        this.buildings = this.#generateBuildings();
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

            let q1 = seg.p1;
            let q2 = add(q1, scale(dir, buildingLength));
            const segments = [new Segment(q1, q2)];

            for (let i = 2; i <= buildingCount; i++) {
                q1 = add(q2, scale(dir, this.spacing));
                q2 = add(q1, scale(dir, buildingLength));
                segments.push(new Segment(q1, q2));
            }

            return segments;
        });

        const bases = supports.map(seg => new Envelop(seg, this.buildingWidth).poly);

        for (let i = 0; i < bases.length - 1; i++) {
            for (let j = i + 1; j < bases.length; j++) {
                if (bases[i].intersectsPoly(bases[j])) {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }
            
        return bases;
    }

    draw(ctx) {
        this.envelopes.forEach(e => e.draw(ctx, { stroke: '#bbb', fill: '#bbb', lineWidth: 15 }));
        this.graph.segments.forEach(s => s.draw(ctx, { color: 'white', width: 4, dash: [10, 10] }));
        this.roadBorders.forEach(r => r.draw(ctx, { color: 'white', width: 5 }));
        this.buildings.forEach(b => b.draw(ctx));
    }
}