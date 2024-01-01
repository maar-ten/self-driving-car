class Visualizer {
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;
        for (let i = network.levels.length - 1; i >= 0; i--) {
            const levelTop = top + lerp(
                height - levelHeight,
                0,
                network.levels.length === 1 ? .5 : i / (network.levels.length - 1)
            );
            ctx.setLineDash([7, 3]);
            const labels = i === network.levels.length - 1 ? ['🠉','🠈','🠊','🠋'] : [];
            Visualizer.drawLevel(
                ctx, network.levels[i], left, levelTop, width, levelHeight, labels
            );
        };
    }

    static drawLevel(ctx, level, left, top, width, height, labels) {
        const { inputs, outputs, weights, biases } = level;
        const right = left + width;
        const bottom = top + height;

        const nodeRadius = 18;
        weights.map((weightArr, i, arr) => [weightArr, this.#getNodeX(arr, i, left, right)])
            .forEach(([weightArr, x1]) =>
                weightArr.map((weight, j, arr) => [weight, x1, this.#getNodeX(arr, j, left, right)])
                    .forEach(([weight, x1, x2]) => {
                        ctx.beginPath();
                        ctx.moveTo(x1, bottom);
                        ctx.lineTo(x2, top);
                        ctx.strokeStyle = getRgba(weight);
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }));

        inputs
            .map((_, i, arr) => [
                this.#getNodeX(arr, i, left, right),
                getRgba(inputs[i])
            ])
            .forEach(([x, color]) => {
                ctx.beginPath();
                ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'black';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, bottom, nodeRadius * .6, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });

        outputs
            .map((_, i, arr) => [
                this.#getNodeX(arr, i, left, right),
                getRgba(outputs[i]),
                getRgba(biases[i]),
                labels[i]
            ])
            .forEach(([x, outColor, biasColor, label]) => {
                ctx.beginPath();
                ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'black';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, top, nodeRadius * .6, 0, Math.PI * 2);
                ctx.fillStyle = outColor;
                ctx.fill();

                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.arc(x, top, nodeRadius * .8, 0, Math.PI * 2);
                ctx.strokeStyle = biasColor;
                ctx.setLineDash([3, 3]);
                ctx.stroke();
                ctx.setLineDash([]);

                if (label) {
                    const offset = nodeRadius * .1;
                    ctx.beginPath();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'black';
                    ctx.strokeStyle = 'white';
                    ctx.font = `${nodeRadius * 1.5}px Arial`;
                    ctx.fillText(label, x, top + offset);
                    ctx.lineWidth = .5;
                    ctx.strokeText(label, x, top + offset);
                }
            });
    }

    static #getNodeX(nodes, index, left, right) {
        return lerp(left, right, nodes.length === 1 ? .5 : index / (nodes.length - 1));
    }
}