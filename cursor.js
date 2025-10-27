// cursor.js - 鼠标拖尾效果
let trail = [];
const trailLength = 20;

function setup() {
  // 创建画布并放入拖尾容器
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('cursor-container');
  
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

  background(0, 0, 0, 10);
  
  // 更新拖尾位置
  trail[trailLength - 1].x = mouseX;
  trail[trailLength - 1].y = mouseY;
  
  for (let i = 0; i < trailLength - 1; i++) {
    trail[i].x = trail[i + 1].x;
    trail[i].y = trail[i + 1].y;
  }
  
  // 绘制拖尾
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