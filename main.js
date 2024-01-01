const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');
const road = new Road(carCanvas.width / 2, carCanvas.width * .9);
const cars = generateCars(100);
let bestCar = cars[0];
if (localStorage.getItem('bestBrain')) {
    bestCar.brain = JSON.parse(localStorage.getItem('bestBrain'));
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2)
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

function generateCars(n) {
    return Array(n).fill().map(_ => new Car(road.getLaneCenter(1), 100, 30, 50, 'AI'));
}

function animate(time) {
    traffic.forEach(car => car.update(road.borders, []));
    cars.forEach(c => c.update(road.borders, traffic));

    const bestCar = cars.find(c => c.y === Math.min(...cars.map(c => c.y)));

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