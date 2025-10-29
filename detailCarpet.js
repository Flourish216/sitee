/**
 *
 * 视频粉碎效果
 * Video Grinder
 * 
 * 主程序
 * 
 * 交互内容：
 * 1、鼠标按住，粉碎摄像头画面
 * 松开停止粉碎过程
 * 2、鼠标滚轮重置画面
 *
 */

var capture; // 摄像头捕获
var x, y, w, h, spx, spy; // 位置，大小，速度
var count = 0; // 当前错位次数
var maxCount = 10; // 错位多少次就重置参数
var picGraph; // 图片所在的子画布
var newImg; // 错位后的新图片

function setup() {
    createCanvas(windowWidth, windowHeight);
    // 初始化摄像头
    capture = createCapture(VIDEO);
    capture.hide(); // 隐藏默认的视频元素
    init();
}

function draw() {
    // 当鼠标按住时，进行图片错位切割
    if (mouseIsPressed == true) {
        if (count >= maxCount) { // 每经过maxCount次就重置一遍参数
            setGrinder();
            count = 0;
            maxCount = int(random(3, 8));
        }
        accel();

        newImg = createImage(width, height);
        newImg.copy(picGraph.get(), x, y, w, h, x, y, w, h); // 获取当前子画布上所有的像素值，并根据x、y、w...等参数生成newImg
        picGraph.image(newImg, spx, spy); // 每帧移动的速度即为每次错位的量，也就是新图的位置
        image(picGraph, 0, 0);

        count++;
    } else {
        // 当没有按住鼠标时，显示正常的摄像头画面
        let videoWidth = windowWidth * 0.7; // 视频宽度为窗口宽度的70%
        let videoHeight = videoWidth * 0.5625; // 保持16:9比例
        let centerX = windowWidth/2 - videoWidth/2;
        let centerY = windowHeight/2 - videoHeight/2;
        image(capture, centerX, centerY, videoWidth, videoHeight);
        picGraph.image(capture, centerX, centerY, videoWidth, videoHeight);
    }

    // 海报
    poster();
}

function init() {
    pixelDensity(3); // 不然图片错位后会糊，注意：这个要在background之前设置
    background(0);

    picGraph = createGraphics(windowWidth, windowHeight);  // 创建子画布
    setGrinder();
}

function poster() {
    // 海报边框
    noFill();
    stroke(255, 255, 255, 240);
    strokeWeight(2);
    line(width / 2 - 230, height/2 - 240, width / 2 + 230, height/2 - 240);

    // 海报文字
    textStyle(NORMAL);
    textSize(8);
    noStroke();
    fill(255, 255, 255);
    text('Video Grinder Effect', width/2 + 155, height/2 - 270);
    text('Hold mouse to distort', width/2 - 213, height/2 + 283);
    ellipse(width/2 + 210, height/2 - 250, 9, 9);
    ellipse(width/2 + 230, height/2 - 250, 9, 9);
    ellipse(width/2 + 250, height/2 - 250, 9, 9);
    textSize(100);
    text('G', width/2 - 185, height/2 + 120);
    textSize(80);
    text('r in', width/2 - 178, height/2 + 188);
    text('d', width/2 + 50, height/2 + 235);
    fill(198, 157, 79);
    text('e', width/2 + 120, height/2 + 255);
    text('r', width/2 + 195, height/2 + 245);
    textStyle(BOLD);
    textSize(80);
    noFill();
    strokeWeight(0.5);
    stroke(255, 255, 255, 240);
    text('VIDEO', width/2 + 40, height/2 - 160);
}

// 鼠标滚轮，重置
function mouseWheel() {
    init();
}

// 设置粉碎效果的参数
function setGrinder() {
    let videoWidth = windowWidth * 0.7;
    let videoHeight = videoWidth * 0.5625;
    let centerX = windowWidth/2 - videoWidth/2;
    let centerY = windowHeight/2 - videoHeight/2;
    
    // 生成条状效果
    if (random() > 0.5) {
        // 横条
        x = centerX;
        y = int(random(centerY, centerY + videoHeight));
        w = videoWidth;
        h = int(random(5, 20)); // 细长的条状
    } else {
        // 竖条
        x = int(random(centerX, centerX + videoWidth));
        y = centerY;
        w = int(random(5, 20)); // 细长的条状
        h = videoHeight;
    }
    
    spx = random(-15, 15);
    spy = random(-15, 15);
}

// 设置加速度
function accel() {
    spx += random(-2, 2);
    spy += random(-2, 2);
}