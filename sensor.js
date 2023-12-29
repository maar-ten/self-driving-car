class Sensor {
    constructor(car) {
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI / 2;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders) {
        this.#castRays();
        this.readings = Array.from(this.rays, ray => this.#getReading(ray, roadBorders));
    }

    #getReading(ray, roadBorders) {
        return roadBorders
            .map(b => getIntersection(ray[0], ray[1], b[0], b[1]))
            .filter(i => i !== null)
            .reduce(
                (acc, curr) => !acc || acc.offset > curr.offset ? curr : acc,
                undefined
            );
    }

    #castRays() {
        this.rays = Array.from(
            Array(this.rayCount),
            (_, index) => {
                const rayAngle = lerp(
                    this.raySpread / 2,
                    -this.raySpread / 2,
                    this.rayCount === 1 ? .5 : index / (this.rayCount - 1)
                ) + this.car.angle;

                const start = { x: this.car.x, y: this.car.y };
                const end = {
                    x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                    y: this.car.y - Math.cos(rayAngle) * this.rayLength
                };
                return [start, end];
            }
        );
    }

    draw(ctx) {
        this.rays.forEach(([start, end], index) => {
            let split = end;

            if (this.readings[index]) {
                split = this.readings[index];
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(split.x, split.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.moveTo(split.x, split.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        });
    }
}