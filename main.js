const carCanvas = document.getElementById('carCanvas');
carCanvas.width = window.innerWidth - 330;
carCanvas.height = window.innerHeight;

const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 300;
networkCanvas.height = window.innerHeight - 300;

const miniMapCanvas = document.getElementById('miniMapCanvas');
miniMapCanvas.width = 300;
miniMapCanvas.height = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const worldString = localStorage.getItem('world');
const worldInfo = worldString ? JSON.parse(worldString) : null;
// const world = worldInfo ? World.load(worldInfo) : new World(new Graph());

const viewport = new Viewport(carCanvas, world.zoom, world.offset);
const miniMap = new MiniMap(miniMapCanvas, world.graph, 300);

const cars = generateCars(1);
let bestCar = cars[0];
if (localStorage.getItem('bestBrain')) {
    cars.forEach((car, i) => {
        car.brain = JSON.parse(localStorage.getItem('bestBrain'));
        if (i !== 0) {
            NeuralNetwork.mutate(car.brain, .1);
        }
    });
}

const traffic = [];

const roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);

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
    const adjustedAngleFn = v => -angle(v) + Math.PI / 2;
    return world.markings.filter(m => m.type === 'start')
        .flatMap(m => Array(n).fill().map(_ => {
            const car = new Car(m.center.x, m.center.y, 30, 50, 'AI', adjustedAngleFn(m.directionVector));
            car.load(carInfo);
            return car;
        }));
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(roadBorders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(roadBorders, traffic);
    }

    bestCar = cars.find(c => c.fitness === Math.max(...cars.map(c => c.fitness)));

    world.cars = cars;
    world.bestCar = bestCar;
    viewport.offset.x = -bestCar.x;
    viewport.offset.y = -bestCar.y;

    viewport.reset();
    const viewPoint = scale(viewport.getOffset(), -1);
    world.draw(carCtx, viewPoint, false);
    miniMap.update(viewPoint);

    traffic.forEach(car => car.draw(carCtx, 'red'));

    networkCtx.lineDashOffset = -time / 100;
    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}