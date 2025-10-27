let particles = [];
const particleCount = 100;

let trail = [];
const trailLength = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化背景粒子
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(1, 5),
      speed: random(0.5, 2),
      angle: random(TWO_PI),
      color: color(random(200, 255), random(200, 255), random(200, 255), 100)
    });
  }
  
  // 初始化鼠标拖尾
  for (let i = 0; i < trailLength; i++) {
    trail.push({
      x: width/2,
      y: height/2,
      size: map(i, 0, trailLength, 5, 20),
      alpha: map(i, 0, trailLength, 50, 200)
    });
  }
}

function draw() {
  // 半透明背景创建拖尾效果
  background(255, 255, 255, 10);
  
  // 更新并绘制背景粒子
  updateParticles();
  
  // 更新并绘制鼠标拖尾
  updateTrail();
}

function updateParticles() {
  for (let p of particles) {
    // 更新位置
    p.x += cos(p.angle) * p.speed;
    p.y += sin(p.angle) * p.speed;
    
    // 边界检查
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    
    // 绘制粒子
    noStroke();
    fill(p.color);
    ellipse(p.x, p.y, p.size);
  }
}

function updateTrail() {
  trail[trailLength - 1].x = mouseX;
  trail[trailLength - 1].y = mouseY;
  
  for (let i = 0; i < trailLength - 1; i++) {
    trail[i].x = trail[i + 1].x;
    trail[i].y = trail[i + 1].y;
  }
  
  for (let i = 0; i < trailLength; i++) {
    const size = trail[i].size;
    const alpha = trail[i].alpha;
    
    noStroke();
    fill(0, 0, 0, alpha); // 黑色半透明
    ellipse(trail[i].x, trail[i].y, size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}