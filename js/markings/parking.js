class Parking extends Marking{
    constructor(center, directionVector, width, height) {
        super(center, directionVector, width, height);
        
        this.borders = [this.poly.segments[0], this.poly.segments[2]];
    }

    draw(ctx) {
        this.borders.forEach(b => b.draw(ctx, {width: 5, color: 'white'}));
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(angle(this.directionVector));

        ctx.beginPath();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.height * .9}px Arial`;
        ctx.fillText('P', 0, 1);

        ctx.restore();
    }
}