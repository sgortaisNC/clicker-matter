// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Detector = Matter.Detector,
  Composite = Matter.Composite;
lost = false;

// constants

// create an engine
var engine = Engine.create({
  gravity: {
    y: 0,
  },
});

// create a renderer
var render = Render.create({
  element: document.getElementById("wrapper"),
  engine: engine,
});

// create two boxes and a ground
var player = Bodies.rectangle(40, 300, 30, 30);
var barrier = Bodies.rectangle(85, 300, 5, 600, { isStatic: true });
var ennemies = [];
var bullets = [];

// add all of the bodies to the world
Composite.add(engine.world, [player, barrier]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

// create a collision detector
var collisionsBarrierEnnemies = Detector.create();
collisionsBarrierEnnemies.bodies.push(barrier);

var collisionsBulletEnnemies = Detector.create();

const fire = () => {
  y = player.position.y;
  x = player.position.x;
  var currentBullet = Bodies.circle(x, y, 2, { isSensor: true });
  Composite.add(engine.world, [currentBullet]);
  bullets.push(currentBullet);
  collisionsBulletEnnemies.bodies.push(currentBullet);
};

const createEnnemy = () => {
  y = Math.random() * 500;
  var currentEnnemy = Bodies.circle(800, y, 20);
  Composite.add(engine.world, [currentEnnemy]);
  ennemies.push(currentEnnemy);
  collisionsBarrierEnnemies.bodies.push(currentEnnemy);
  collisionsBulletEnnemies.bodies.push(currentEnnemy);
};

createEnnemy();

const ennemiesInterval = setInterval(createEnnemy, 7000);

const movingInterval = setInterval(() => {
  ennemies.forEach((ennemy) => {
    ennemy.position.x -= 0.2;
  });
  if (ennemies.length > 0) {
    bullets.forEach((bullet) => {
      bullet.position.x += 0.1;
      Matter.Body.setPosition(
        bullet,
        Matter.Vector.create(bullet.position.x, ennemies[0].position.y)
      );
    });
  }
}, 1000);

document.addEventListener("click", fire);

setInterval(() => {
  if (!lost) {
    if (Matter.Detector.collisions(collisionsBulletEnnemies).length > 0) {
      if (ennemies.length > 0) {
        Composite.remove(engine.world, [
          Matter.Composite.get(
            engine.world,
            Matter.Detector.collisions(collisionsBulletEnnemies)[0].bodyA.id,
            "body"
          ),
          Matter.Composite.get(
            engine.world,
            Matter.Detector.collisions(collisionsBulletEnnemies)[0].bodyB.id,
            "body"
          ),
        ]);
      }
      bullets = bullets.slice(1);
      ennemies = ennemies.slice(1);
      Matter.Detector.clear(collisionsBulletEnnemies);
      Matter.Detector.clear(collisionsBarrierEnnemies);
      collisionsBarrierEnnemies.bodies.push(barrier);
      ennemies.forEach((ennemy) => {
        collisionsBulletEnnemies.bodies.push(ennemy);
        collisionsBarrierEnnemies.bodies.push(ennemy);
      });
      bullets.forEach((bullet) => {
        collisionsBulletEnnemies.bodies.push(bullet);
      });
    }
    if (Matter.Detector.collisions(collisionsBarrierEnnemies).length > 0) {
      lost = true;
      document.querySelector("#restartButton").disabled = false;
      clearInterval(ennemiesInterval);
      clearInterval(movingInterval);
    }
  }
}, 1000);
