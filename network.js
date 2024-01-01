class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = [];

        // todo with modern array methods
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(
                neuronCounts[i], neuronCounts[i + 1]
            ));
        }
    }

    static feedForward(givenInputs, network) {
        // todo with modern array methods
        let outputs = Level.feedForward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(
                outputs, network.levels[i]);
        }
        return outputs;
    }

    static mutate(network, amount = 1) {
        const mutationFn = a => lerp(a, Math.random() * 2 - 1, amount);
        network.levels.forEach(l => {
            l.biases.forEach((bias, i) => l.biases[i] = mutationFn(bias));
            l.weights.forEach((v, i) =>
                v.forEach((weight, j) => l.weights[i][j] = mutationFn(weight)));
        });
    }
}

class Level {
    constructor(inputCount, outputCount) {
        this.inputs = Array(inputCount).fill();
        this.outputs = Array(outputCount).fill();
        this.biases = Array(outputCount).fill();

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = Array(outputCount);
        }

        Level.#randomize(this);
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        level.biases.forEach((_, i) => level.biases[i] = Math.random() * 2 - 1);
    }

    static feedForward(givenInputs, level) {
        level.inputs.forEach((_, i, arr) => arr[i] = givenInputs[i]);

        level.outputs.forEach((_, i, arr) => {
            const sum = level.inputs.reduce(
                (acc, curr, j) => acc += curr * level.weights[j][i],
                0
            );
            arr[i] = sum > level.biases[i] ? 1 : 0;
        });
        return level.outputs;
    }
}