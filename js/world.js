class World {
    constructor(graph, roadWidth = 100, roadRoundness = 10) {
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;

        this.envelops = [];
        this.roadBorders = [];
        
        this.generate();
    }

    generate() {
        this.envelops.length = 0;
        this.envelops = this.graph.segments.map(s => new Envelop(s, this.roadWidth, this.roadRoundness));
        this.roadBorders = Polygon.union(this.envelops.map(e => e.poly));
    }

    draw(ctx) {
        this.envelops.forEach(e => e.draw(ctx, {stroke: '#bbb', fill: '#bbb', lineWidth: 15}));
        this.graph.segments.forEach(s => s.draw(ctx, {color: 'white', width: 4, dash: [10, 10]}));
        this.roadBorders.forEach(r => r.draw(ctx, {color: 'white', width: 5}));
    }
}