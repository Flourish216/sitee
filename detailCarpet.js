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
    let videoWidth = windowWidth * 0.7; // 视频宽度为窗口宽度的70%
    let videoHeight = videoWidth * 0.5625; // 保持16:9比例
    let centerX = windowWidth/2 - videoWidth/2;
    let centerY = windowHeight/2 - videoHeight/2;

    background(0); // 每帧清除背景

    if (mouseIsPressed == true) {
        if (count >= maxCount) { // 每经过maxCount次就重置一遍参数
            setGrinder();
            count = 0;
            maxCount = int(random(2, 4)); // 减少重置间隔，使效果更连续
        }
        accel();

        // 更新主画布
        picGraph.background(0);
        picGraph.image(capture, centerX, centerY, videoWidth, videoHeight);
        
        // 创建切割效果
        newImg = createImage(width, height);
        newImg.copy(picGraph.get(), x, y, w, h, x, y, w, h);
        
        // 在原位置涂黑（模拟切割）
        picGraph.fill(0);
        picGraph.noStroke();
        picGraph.rect(x, y, w, h);
        
        // 显示切割后的画面
        image(picGraph, 0, 0);
        // 显示移动的切片
        image(newImg, x + spx, y + spy);

        count++;
    } else {
        // 当没有按住鼠标时，显示正常的摄像头画面
        image(capture, centerX, centerY, videoWidth, videoHeight);
        // 重置画布
        picGraph.background(0);
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
    let videoWidth = windowWidth * 0.7;
    let videoHeight = videoWidth * 0.5625;
    let centerX = windowWidth/2 - videoWidth/2;
    let centerY = windowHeight/2 - videoHeight/2;

    push();
    // 标题区域
    let titleBoxWidth = videoWidth * 0.8;
    let titleBoxX = windowWidth/2 - titleBoxWidth/2;
    
    // 上方装饰线
    noFill();
    stroke(255, 255, 255, 240);
    strokeWeight(2);
    line(titleBoxX, centerY - 80, titleBoxX + titleBoxWidth, centerY - 80);

    // 主标题
    textAlign(CENTER, CENTER);
    let mainColor = color(255, 255, 255);
    let accentColor = color(198, 157, 79);
    
    // VIDEO 文字
    textStyle(BOLD);
    textSize(42);
    fill(mainColor);
    noStroke();
    text('VIDEO', windowWidth/2, centerY - 120);

    // GRINDER 文字
    let grinderX = windowWidth/2;
    let grinderY = centerY - 40;
    textSize(58);
    text('GRIND', grinderX - 40, grinderY);
    fill(accentColor);
    text('ER', grinderX + 90, grinderY);

    // 副标题和说明
    textStyle(NORMAL);
    textSize(14);
    fill(mainColor);
    text('DIGITAL DISTORTION', windowWidth/2, centerY - 160);
    
    // 右上角装饰点
    let dotsX = titleBoxX + titleBoxWidth - 60;
    let dotsY = centerY - 140;
    for (let i = 0; i < 3; i++) {
        ellipse(dotsX + i * 15, dotsY, 6, 6);
    }

    // 底部提示文本
    textSize(16);
    fill(255, 255, 255, 180);
    text('HOLD MOUSE TO DISTORT • SCROLL TO RESET', windowWidth/2, centerY + videoHeight/2 + 40);

    // 底部装饰线
    strokeWeight(1);
    stroke(255, 255, 255, 120);
    let bottomLineWidth = videoWidth * 0.3;
    let bottomLineX = windowWidth/2 - bottomLineWidth/2;
    line(bottomLineX, centerY + videoHeight/2 + 70, 
         bottomLineX + bottomLineWidth, centerY + videoHeight/2 + 70);

    pop();
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
        y = int(random(centerY, centerY + videoHeight - 20));
        w = videoWidth;
        h = int(random(15, 35)); // 增加条的宽度
    } else {
        // 竖条
        x = int(random(centerX, centerX + videoWidth - 20));
        y = centerY;
        w = int(random(15, 35)); // 增加条的宽度
        h = videoHeight;
    }
    
    // 随机决定移动方向
    if (random() > 0.5) {
        spx = random(20, 35) * (random() > 0.5 ? 1 : -1);
        spy = random(-8, 8);
    } else {
        spx = random(-8, 8);
        spy = random(20, 35) * (random() > 0.5 ? 1 : -1);
    }
}

// 设置加速度
function accel() {
    // 保持主要运动方向，只添加小幅度随机偏移
    if (abs(spx) > abs(spy)) {
        spx += random(-1, 1);
        spy = constrain(spy + random(-0.5, 0.5), -10, 10);
    } else {
        spy += random(-1, 1);
        spx = constrain(spx + random(-0.5, 0.5), -10, 10);
    }
}