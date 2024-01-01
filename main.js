const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');
const road = new Road(carCanvas.width / 2, carCanvas.width * .9);
const cars = generateCars(1);
let bestCar = cars[0];
if (localStorage.getItem('bestBrain')) {
    cars.forEach((car, i) => {
        car.brain = JSON.parse(localStorage.getItem('bestBrain'));
        if (i !== 0) {
            NeuralNetwork.mutate(car.brain, .05);
        }
    });
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(0), -900, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(0), -1100, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(1), -1100, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(2), -1300, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(0), -1500, 30, 50, 'DUMMY', 4, getRandomColor()),
    new Car(road.getLaneCenter(1), -1500, 30, 50, 'DUMMY', 4, getRandomColor()),
];

animate();

function save() {
    localStorage.setItem(
        'bestBrain',
        JSON.stringify(bestCar.brain)
    );
}

function discard() {
    localStorage.removeItem('bestBrain');
}

function download() {
    const element = document.createElement('a');
    element.setAttribute(
        'href',
        `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(bestCar.brain))}`
    );

    const filename = 'name.brain';
    element.setAttribute('download', filename);
    element.click();
}

function load(evt) {
    const file = evt.target.files[0];

    if (!file) {
        alert('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = event => {
        const fileContent = event.target.result;
        const jsonData = JSON.parse(fileContent);
        localStorage.setItem('bestBrain', JSON.stringify(jsonData));
        location.reload();
    }
}

function generateCars(n) {
    return Array(n).fill().map(_ => new Car(road.getLaneCenter(1), 100, 30, 50, 'AI'));
}

function animate(time) {
    traffic.forEach(car => car.update(road.borders, []));
    cars.forEach(c => c.update(road.borders, traffic));

    bestCar = cars.find(c => c.y === Math.min(...cars.map(c => c.y)));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * .7);

    road.draw(carCtx);
    traffic.forEach(car => car.draw(carCtx, 'red'));
    carCtx.globalAlpha = .2;
    cars.forEach(c => c.draw(carCtx, 'blue'));
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, 'blue', true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 100;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}