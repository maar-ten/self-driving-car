class Tree {
    constructor(center, size, height = 200) {
        this.center = center;
        this.size = size;
        this.height = height;
        this.base = this.#generateLevel(center, size);
    }

    #generateLevel(point, size) {
        const points = [];
        const rad = size / 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
            const kindOfRandom = Math.cos(((a + this.center.x) * size) % 17) ** 2;
            const noisyRadius = rad * lerp(.5, 1, kindOfRandom);
            points.push(translate(point, a, noisyRadius));
        }
        return new Polygon(points);
    }
    
    draw(ctx, viewPoint) {
        const top = getFake3dPoint(this.center, viewPoint, this.height);

        Array.from(Array(7)).forEach((_, level, levels) => {
            const t = level / (levels.length - 1);
            const point = lerp2D(this.center, top, t);
            const color = `rgb(30, ${lerp(50, 200, t)}, 70)`;
            const size = lerp(this.size, 40, t);
            const poly = this.#generateLevel(point, size);
            poly.draw(ctx, { fill: color, stroke: 'rgba(0, 0, 0, 0)' });
        });
    }
}