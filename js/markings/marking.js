class Marking {
    constructor(center, directionVector, width, height) {
        this.center = center;
        this.directionVector = directionVector;
        this.width = width;
        this.height = height;

        this.support = new Segment(
            translate(center, angle(directionVector), height / 2),
            translate(center, angle(directionVector), -height / 2),
        );
        this.poly = new Envelop(this.support, width, 0).poly;
        this.type = 'marking';
    }

    static load({ type, center, directionVector, width, height }) {
        const point = new Point(center.x, center.y);
        const dir = new Point(directionVector.x, directionVector.y);
        switch (type) {
            case 'crossing':
                return new Crossing(point, dir, width, height);
            case 'light':
                return new Light(point, dir, width, height);
            case 'marking':
                return new Marking(point, dir, width, height);
            case 'parking':
                return new Parking(point, dir, width, height);
            case 'start':
                return new Start(point, dir, width, height);
            case 'stop':
                return new Stop(point, dir, width, height);
            case 'target':
                return new Target(point, dir, width, height);
            case 'yield':
                return new Yield(point, dir, width, height);
        }
    }
    draw(ctx) {
        this.poly.draw(ctx);
    }
}