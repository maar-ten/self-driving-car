class Sensor {
    constructor(car) {
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI / 2;
        this.rayOffset = 0;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic) {
        this.#castRays();
        this.readings = Array.from(this.rays, ray => this.#getReading(ray, roadBorders, traffic));
    }

    #getReading(ray, roadBorders, traffic) {
        let touches = [];

        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if (touch) {
                touches.push(touch);
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;
            for (let j = 0; j < poly.length; j++) {
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                );
                if (value) {
                    touches.push(value);
                }
            }
        }

        if (touches.length == 0) {
            return null;
        } else {
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset == minOffset);
        }
    }

    #castRays() {
        this.rays = Array.from(
            Array(this.rayCount),
            (_, index) => {
                const rayAngle = lerp(
                    this.raySpread / 2,
                    -this.raySpread / 2,
                    this.rayCount === 1 ? .5 : index / (this.rayCount - 1)
                ) + this.car.angle + this.rayOffset;

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
            let endpoint = end;

            if (this.readings[index]) {
                endpoint = this.readings[index];
            }

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                start.x,
                start.y
            );
            ctx.lineTo(
                endpoint.x,
                endpoint.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo(
                end.x,
                end.y
            );
            ctx.lineTo(
                endpoint.x,
                endpoint.y
            );
            ctx.stroke();
        });
    }
}