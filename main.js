const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 200;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');
const road = new Road(carCanvas.width / 2, carCanvas.width * .9);
const car = new Car(road.getLaneCenter(1), 100, 30, 50, 'AI');
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, 'DUMMY', 2)
];

animate();

function animate() {
    traffic.forEach(car => car.update(road.borders, []));
    car.update(road.borders, traffic);

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -car.y + carCanvas.height * .7);

    road.draw(carCtx);
    traffic.forEach(car => car.draw(carCtx, 'red'));
    car.draw(carCtx, 'blue');

    carCtx.restore();

    Visualizer.drawNetwork(networkCtx, car.brain);
    requestAnimationFrame(animate);
}