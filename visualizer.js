class Visualizer {
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        Visualizer.drawLevel(ctx, network.levels[0], left, top, width, height);
    }

    static drawLevel(ctx, { inputs, outputs, weights }, left, top, width, height) {
        const right = left + width;
        const bottom = top + height;

        const nodeRadius = 18;
        inputs.map((_, i, arr) => [i, this.#getNodeX(arr, i, left, right)])
            .forEach(([i, x1]) =>
                outputs.map((_, j, arr) => [i, x1, j, this.#getNodeX(arr, j, left, right)])
                    .forEach(([i, x1, j, x2]) => {
                        const value = weights[i][j];
                        const alpha = Math.abs(value);
                        const R = value < 0 ? 0 : 255;
                        const G = value < 0 ? 0 : 255;
                        const B = value > 0 ? 0 : 255;

                        ctx.beginPath();
                        ctx.moveTo(x1, bottom);
                        ctx.lineTo(x2, top);
                        ctx.strokeStyle = `rgba(${R}, ${G}, ${B}, ${alpha})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }));

        inputs
            .map((_, i, arr) => this.#getNodeX(arr, i, left, right))
            .forEach(x => {
                ctx.beginPath();
                ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            });

        outputs
            .map((_, i, arr) => this.#getNodeX(arr, i, left, right))
            .forEach(x => {
                ctx.beginPath();
                ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
            });
    }

    static #getNodeX(nodes, index, left, right) {
        return lerp(left, right, nodes.length === 1 ? .5 : index / (nodes.length - 1));
    }
}