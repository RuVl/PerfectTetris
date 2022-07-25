const mainField = document.getElementById('main-field'),
      gameOver = document.getElementById('game-over'),
      TETRIS = document.getElementById('TETRIS'),
      extraField = document.getElementById('extra-field'),
      nextFigure = document.getElementById('next-figure'),
      FAQ = document.getElementById('FAQ'),
      scoreField = document.getElementById('score'),
      context = nextFigure.getContext('2d'),
      canv  = document.getElementById('canvas'),
      ctx   = canv.getContext('2d');

nextFigure.height = extraField.offsetHeight;
nextFigure.width = extraField.offsetWidth;
canv.height = mainField.offsetHeight;
canv.width = mainField.offsetWidth;

const fieldSizeX        = 10,
      fieldSizeY        = 20,
      lineWidth         = 2,
      shadowWidth       = 2.5,
      fallSpeed         = 1000/240,
      figures           = [
          [
              [
                  [1,1,1,1]
              ],
              [
                  [1],
                  [1],
                  [1],
                  [1]
              ]
          ],  // I
          [
              [
                  [1,1],
                  [1,1]
              ]
          ],  // O
          [
              [
                  [1,1,1],
                  [0,1,0]
              ],
              [
                  [0,1],
                  [1,1],
                  [0,1]
              ],
              [
                  [0,1,0],
                  [1,1,1]
              ],
              [
                  [1,0],
                  [1,1],
                  [1,0]
              ]
          ],  // T
          [
              [
                  [1,1,0],
                  [0,1,1]
              ],
              [
                  [0,1],
                  [1,1],
                  [1,0]
              ]
          ],  // Z
          [
              [
                  [0,1,1],
                  [1,1,0]
              ],
              [
                  [1,0],
                  [1,1],
                  [0,1]
              ]
          ],  // S
          [
              [
                  [0,1],
                  [0,1],
                  [1,1],
              ],
              [
                  [1,0,0],
                  [1,1,1],
              ],
              [
                  [1,1],
                  [1,0],
                  [1,0],
              ],
              [
                  [1,1,1],
                  [0,0,1],
              ]
          ],  // J
          [
              [
                  [1,0],
                  [1,0],
                  [1,1],
              ],
              [
                  [1,1,1],
                  [1,0,0],
              ],
              [
                  [1,1],
                  [0,1],
                  [0,1],
              ],
              [
                  [0,0,1],
                  [1,1,1],
              ]
          ]   // L
      ],
      bg_color          = '#222',
      gradients         = [
          ['#9f2ef4', '#f97d64', '#ffcd42'],
          ['#fc9c3d', '#cd364f', '#9814b3'],
          ['#f7764a', '#f9cc7b'],
          ['#e34df5', '#2ddffc'],
          ['#fa7ed1', '#8886fc'],
          ['#ef9c75', '#c3889c']
      ],
      nextFigureColor   = ctx.createLinearGradient(0, 0, nextFigure.width, nextFigure.height);
      fieldGradient     = ctx.createLinearGradient(0, 0, canv.width, canv.height);

let stepX             = canv.width/fieldSizeX,
    stepY             = canv.height/fieldSizeY,
    nextFigureStepX   = nextFigure.width/4,
    nextFigureStepY   = nextFigure.height/4;

nextFigureColor.addColorStop(0, '#ccc');
nextFigureColor.addColorStop(1, '#666');
fieldGradient.addColorStop(0, '#ddd');
fieldGradient.addColorStop(1, '#555');

let isStarted = false,
    figureSpeed = 10,
    field = Array(fieldSizeY),
    figure, next_figure,
    pos = {
        x: 0,
        y: 0,
        new_figure: function (figure) {
            this.x = Math.floor(fieldSizeX/2 - figure[0].length/2);
            this.y = -figure.length;
        },
        _shadowX: 0,
        _shadowY: 0,
        get shadow() {
            return {x: this._shadowX, y: this._shadowY};
        },
        set shadow(pos) {
            this._shadowX = pos.x;
            this._shadowY = pos.y;
        }
    },
    scores = {
        score: 0,
        add: function (lines) {
            switch (lines) {
                case 1:
                    fireworks.run(50);
                    this.score += 100;
                    break;
                case 2:
                    fireworks.run(100);
                    this.score += 300;
                    break;
                case 3:
                    fireworks.run(200);
                    this.score += 700;
                    break;
                case 4:
                    fireworks.run(500);
                    this.score += 1500;
                    showTETRIS();
                    break;
            }

            scoreField.innerText = 'Очки: ' + this.score;

            if (this.score < 5000) figureSpeed = 2;
            else if (this.score < 15000) figureSpeed = 4;
            else if (this.score < 25000) figureSpeed = 6;
            else if (this.score < 50000) figureSpeed = 8;
            else if (this.score < 75000) figureSpeed = 10;
            else figureSpeed = 15; // CRAZY
        }
    },
    cells_check = {
        left: [],
        right: [],
        down: [],
        reset: function () {
            figureSpeed = 2;
            pos.shadow = {x:0, y:0};
            this.left = [];
            this.right = [];
            this.down = [];
        }
    },
    timer;

const fireworks = new Fireworks();

function showTETRIS(is=true) {
    TETRIS.style.opacity = is ? '.25' : '0';
    if (is) setTimeout(() => showTETRIS(false), 1500);
}

function drawCells() {
    ctx.fillStyle = bg_color;
    context.fillStyle = bg_color;
    ctx.fillRect(0, 0, canv.width, canv.height);
    context.fillRect(0, 0, nextFigure.width, nextFigure.height);

    ctx.strokeStyle = fieldGradient;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let x = 0; x <= fieldSizeX; x++) {
        ctx.moveTo(x * stepX, 0);
        ctx.lineTo(x * stepX, canv.height);
    }
    for (let y = 0; y <= fieldSizeY; y++) {
        ctx.moveTo(0, y * stepY);
        ctx.lineTo(canv.width, y * stepY);
    }
    ctx.stroke();

    context.lineWidth = lineWidth;
    context.strokeStyle = nextFigureColor;
    context.beginPath();
    for (let x = 0; x <= nextFigure.width; x += nextFigureStepX) {
        context.moveTo(x, 0);
        context.lineTo(x, nextFigure.height);
    }
    for (let y = 0; y <= nextFigure.height; y += nextFigureStepY) {
        context.moveTo(0, y);
        context.lineTo(nextFigure.width, y);
    }
    context.stroke();
}

function drawField(type='normal') {
    let gradient;
    if (type === 'load')
        gradient = getRandomGradient();

    for (let y = 0; y < field.length; y++) {
        if (type === 'load')
            Object.assign(field[y], {gradient: Array(field[y].length)});

        for (let x = 0; x < field[y].length; x++) {
            if (field[y][x] === 1) {
                if (type === 'load') ctx.fillStyle = gradient;
                else ctx.fillStyle = field[y].gradient[x];

                console.log('hi');

                ctx.fillRect(x * stepX + lineWidth, y * stepY + lineWidth,
                    stepX - lineWidth * 2, stepY - lineWidth * 2);
            }
        }
    }
}

function drawFigure(pos, type) {
    if (type === 'bg' || type === 'shadow_bg') {
        ctx.fillStyle = bg_color;
        ctx.strokeStyle = fieldGradient;
    }
    else {
        if (type === 'load') Object.assign(figure, {gradient: getRandomGradient()});
        ctx.fillStyle = figure.gradient;
        ctx.strokeStyle = figure.gradient;
    }

    ctx.beginPath();

    figure.forEach((a, y) =>
       a.forEach((v, x) => {
           if (v === 1) {
               if (type === 'shadow_bg') {
                   ctx.fillRect((x + pos.x) * stepX, (y + pos.y) * stepY, stepX, stepY);
                   ctx.rect((x + pos.x) * stepX, (y + pos.y) * stepY, stepX, stepY);
               } else
                   ctx.rect((x + pos.x) * stepX + lineWidth, (y + pos.y) * stepY + lineWidth,
                       stepX - lineWidth * 2, stepY - lineWidth * 2);
           }
       })
    );

    if (type === 'shadow' || type === 'shadow_bg') {
        ctx.lineWidth = type === 'shadow' ? shadowWidth : lineWidth;
        ctx.stroke();
    }
    else {
        ctx.lineWidth = lineWidth;
        ctx.fill();
    }
}

function drawShadow(type) {
    if (type === 'bg') {
        drawFigure(pos.shadow, 'shadow_bg');
        return;
    }
    pos.shadow = {
        x: pos.x,
        y: pos.y + checkCollisionDirection('ArrowDown')
    }
    drawFigure(pos.shadow, 'shadow');
}

function drawNextFigure(type) {
    if (type === 'bg') context.fillStyle = bg_color;
    else {
        if (type === 'load') Object.assign(next_figure, {gradient: getRandomGradient()});
        context.fillStyle = next_figure.gradient;
    }

    let f = next_figure.map(a => a.slice());
    while (f.length < 3) f.unshift(Array(f[0].length).fill(0));
    while (f[0].length < 3) for (let y = 0; y < f.length; y++) f[y].unshift(0);

    f.forEach((a, y) =>
        a.forEach((v, x) => {
            if (v === 1)
                context.fillRect(x * nextFigureStepX + lineWidth, y * nextFigureStepY + lineWidth,
                    nextFigureStepX - lineWidth * 2, nextFigureStepY - lineWidth * 2);
        })
    );
}

function checkCollisionDirection(direction) {
    switch (direction) {
        case 'down':
            if (!cells_check.down.length)  // Если массив пуст
                for (let x = 0; x < figure[0].length; x++)
                    for (let y = figure.length - 1; y >= 0; y--)
                        if (figure[y][x] === 1) {
                            cells_check.down[x] = y + 1;
                            break;
                        }

            for (let x = 0; x < cells_check.down.length; x++) {
                if (pos.y + cells_check.down[x] === fieldSizeY) return true;
                if (pos.y + cells_check.down[x] >= 0 &&  // Если еще не на поле
                    field[pos.y + cells_check.down[x]][pos.x + x] === 1) return true;
            }
            break;
        case 'ArrowLeft':
            if (!cells_check.left.length)  // Если массив пуст
                for (let y = 0; y < figure.length; y++)
                    for (let x = 0; x < figure[y].length; x++)
                        if (figure[y][x] === 1) {
                            cells_check.left[y] = x-1;
                            break;
                        }

            for (let y = 0; y < cells_check.left.length; y++) {
                if (pos.x + cells_check.left[y] === -1) return true;  // Итерирование по y дает значение x
                if (pos.y + y < 0) continue;  // Если координата по y < 0, то переходим на след значение y
                if (field[pos.y + y][pos.x + cells_check.left[y]] === 1) return true;
            }

            break;
        case 'ArrowRight':
            if (!cells_check.right.length)  // Если массив пуст
                for (let y = 0; y < figure.length; y++)
                    for (let x = figure[y].length-1; x >= 0; x--)
                        if (figure[y][x] === 1) {
                            cells_check.right[y] = x+1;
                            break;
                        }

            for (let y = 0; y < cells_check.right.length; y++) {
                if (pos.x + cells_check.right[y] === fieldSizeX) return true;  // Итерирование по y дает значение x
                if (pos.y + y < 0) continue;  // Если координата по y < 0, то переходим на след значение y
                if (field[pos.y + y][pos.x + cells_check.right[y]] === 1) return true;
            }

            break;
        case 'ArrowDown':
            if (!cells_check.down.length)  // Если массив пуст
                for (let x = 0; x < figure[0].length; x++)
                    for (let y = figure.length - 1; y >= 0; y--)
                        if (figure[y][x] === 1) {
                            cells_check.down[x] = y+1;
                            break;
                        }

            let max_down = fieldSizeY-pos.y;

            for (let x = 0; x < cells_check.down.length; x++) {
                let maxY = 0;
                for (let y = pos.y + cells_check.down[x]; y < fieldSizeY; y++) {
                    if (y >= 0 && field[y][pos.x + x] === 1) break;
                    maxY++;
                }
                max_down = maxY < max_down ? maxY : max_down;
            }

            return max_down;
    }
}

function getRandomGradient() {
    let grad = gradients[Math.floor(Math.random() * gradients.length)];

    let gradient = ctx.createLinearGradient(0, 0, canv.width, canv.height);
    for (let i = 0; i < grad.length; i++)
        gradient.addColorStop(i/(grad.length-1), grad[i]);

    return gradient;
}

function getRandomFigure() {
    let figure_type_index = Math.floor(Math.random() * figures.length);
    let figure_list = figures[figure_type_index];

    let figure_index = Math.floor(Math.random() * figure_list.length);
    let figure = figure_list[figure_index];

    Object.assign(figure, {
        figure_type_index: figure_type_index,
        figure_index: figure_index,
        gradient: getRandomGradient()
    });

    return figure;
}

function tryRotate() {
    let figure_list = figures[figure.figure_type_index];
    if (figure_list.length === 1) return figure;  // Квадрат

    let figure_index = figure_list.length-1 === figure.figure_index ? 0 : figure.figure_index+1;
    let new_figure = figure_list[figure_index];

    for (let y = 0; y < new_figure.length; y++)
        for (let x = 0; x < new_figure[y].length; x++) {
            if (pos.x + new_figure[y].length > fieldSizeX) return figure;  // Вышли за правую границу
            if (pos.y + y < 0) break;  // Если координата по y < 0, то переходим на след значение y
            if (new_figure[y][x] === 1 && field[pos.y + y][pos.x + x] === 1) return figure;  // Коллизия
        }

    Object.assign(new_figure, {
        figure_type_index: figure.figure_type_index,
        figure_index: figure_index,
        gradient: figure.gradient
    });

    return new_figure;
}

function fellFigure() {
    drawNextFigure('bg');
    drawShadow('bg');
    drawFigure(pos);

    let fullLines = 0;
    for (let y = 0; y < figure.length; y++) {
        let fieldY = pos.y + y;
        for (let x = 0; x < figure[y].length; x++) {
            if (pos.y + y < 0) {  // Конец игры
                localStorage.clear();
                fireworks.run(scores.score/10);
                gameOver.style.opacity = '1';
                isStarted = false;
                cells_check.reset();
                return;
            }
            if (figure[y][x] === 1) {
                field[fieldY][pos.x + x] = figure[y][x];  // Пушим на поле

                if (field[fieldY].gradient) field[fieldY].gradient[pos.x + x] = figure.gradient;
                else {
                    let grad = Array(field[fieldY].length);
                    grad[pos.x + x] = figure.gradient;
                    Object.assign(field[fieldY], {gradient: grad});
                }
            }
        }

        let lineIsFull = true;
        for (let x = 0; x < field[y].length; x++)  // Проверяем заполненность линии
            if (field[fieldY][x] === 0) {
                lineIsFull = false;
                break;
            }
        if (lineIsFull) {  // Линия заполнена
            fullLines++;

            for (let fy = fieldY; fy > 0; fy--) {
                field[fy] = field[fy-1];

                for (let x = 0; x < fieldSizeX; x++) {
                    if (field[fy][x] === 1) ctx.fillStyle = field[fy].gradient[x];
                    else ctx.fillStyle = bg_color;

                    ctx.fillRect(x * stepX + lineWidth, fy * stepY + lineWidth, stepX - lineWidth * 2, stepY - lineWidth * 2);
                }
            }
            field[0] = Array(fieldSizeX).fill(0);
        }
    }
    scores.add(fullLines);

    figure = next_figure;
    next_figure = getRandomFigure();
    pos.new_figure(figure);
    cells_check.reset();

    save();

    drawNextFigure();
    drawShadow();
}

function save() {
    localStorage.setItem('field', JSON.stringify(field));

    localStorage.setItem('current_figure_type_index', figure.figure_type_index.toString());
    localStorage.setItem('current_figure_index', figure.figure_index.toString());

    localStorage.setItem('score', JSON.stringify(scores.score));

    localStorage.setItem('next_figure_type_index', next_figure.figure_type_index.toString());
    localStorage.setItem('next_figure_index', next_figure.figure_index.toString());
}

function load() {
    // localStorage.clear()
    let f = localStorage.getItem('field');
    if (!f) return false;

    let temp_field = JSON.parse(f);

    let figure_type_index = parseInt(localStorage.getItem('current_figure_type_index')),
        figure_index = parseInt(localStorage.getItem('current_figure_index'));

    let temp_score = JSON.parse(localStorage.getItem('score'));

    let next_figure_type_index = parseInt(localStorage.getItem('next_figure_type_index')),
        next_figure_index = parseInt(localStorage.getItem('next_figure_index'));

    if (isNaN(temp_score) ||
        isNaN(figure_index) ||
        isNaN(figure_type_index) ||
        isNaN(next_figure_index) ||
        isNaN(next_figure_type_index)) return false;

    field = temp_field;

    figure = figures[figure_type_index][figure_index];
    Object.assign(figure, {
        figure_type_index: figure_type_index,
        figure_index: figure_index,
    });

    scores.score = temp_score;

    next_figure = figures[next_figure_type_index][next_figure_index];
    Object.assign(next_figure, {
        figure_type_index: next_figure_type_index,
        figure_index: next_figure_index,
    });

    pos.new_figure(figure);
    scores.add(0);  // Пишем очки

    drawField('load');
    drawFigure(pos, 'load');
    drawNextFigure('load');

    return true;
}

function start() {
    if (!isStarted) return;
    if (checkCollisionDirection('down')) {  // Упала
        fellFigure();
        start();
        return;
    }

    drawFigure(pos, 'bg');
    pos.y++;
    drawFigure(pos);

    timer = setTimeout(start, 1000/figureSpeed);
}

document.onkeydown = (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            if (!isStarted) break;
            if (checkCollisionDirection(e.key)) break;

            drawFigure(pos, 'bg');
            drawShadow('bg');
            pos.x--;
            drawFigure(pos);
            drawShadow();

            break;
        case 'ArrowRight':
            if (!isStarted) break;
            if (checkCollisionDirection(e.key)) break;

            drawFigure(pos, 'bg');
            drawShadow('bg');
            pos.x++;
            drawFigure(pos);
            drawShadow();

            break;
        case ' ': // If isStarted equals ArrowUp
            if (isStarted) {
                drawFigure(pos, 'bg');
                drawShadow('bg');

                figure = tryRotate();
                cells_check.reset();

                drawFigure(pos);
                drawShadow();
            } else {
                FAQ.style.display = 'none';
                gameOver.style.opacity = '0';

                for (let i = 0; i < field.length; i++)
                    field[i] = Array(fieldSizeX).fill(0);

                scores.score = 0;
                scoreField.innerText = 'Очки: 0';

                drawCells();

                if (!load()) {
                    next_figure = getRandomFigure();
                    figure = getRandomFigure();
                    pos.new_figure(figure);
                    drawNextFigure();
                }

                cells_check.reset();
                drawShadow();

                isStarted = true;
                start();
            }
            break;
        case 'ArrowUp':
            if (!isStarted) break;

            drawFigure(pos, 'bg');
            drawShadow('bg');

            figure = tryRotate();
            cells_check.reset();

            drawFigure(pos);
            drawShadow();

            break;
        case 'ArrowDown':
            if (!isStarted) break;

            clearTimeout(timer);
            isStarted = false;

            function fall(max) {
                if (max === 0) {  // Упала
                    fellFigure();
                    isStarted = true;
                    start();
                    return;
                }

                drawFigure(pos, 'bg');
                drawShadow('bg');
                pos.y++;
                max--;
                drawFigure(pos);
                drawShadow();

                setTimeout(() => fall(max), fallSpeed);
            }
            fall(checkCollisionDirection(e.key));

            break;
        case 'p':
        case 'з':
            if (timer !== 'pause' && isStarted) {
                isStarted = false;
                FAQ.style.display = 'flex';
                let span_list = FAQ.getElementsByTagName('span');
                span_list[0].innerText = 'Нажмите "p" для продолжения';
                span_list[1].innerText = 'Нажмите пробел для перезапуска';
                clearTimeout(timer);
                timer = 'pause';
            } else {
                if (timer === 'pause') {
                    isStarted = true;
                    FAQ.style.display = 'none';
                    start();
                }
            }
            break;
        case 'Shift':
            clearTimeout(timer)
            figureSpeed = 20;
            start();
            break;
    }
}

let scoreRotateAngle = -45;
function scoreGradientRotate() {
    scoreRotateAngle++;
    scoreField.style.setProperty('--score-gradient', scoreRotateAngle + 'deg');
    requestAnimationFrame(scoreGradientRotate.bind());
}
scoreGradientRotate();

window.addEventListener('resize', () => {
    nextFigure.height = extraField.offsetHeight;
    nextFigure.width = extraField.offsetWidth;
    canv.height = mainField.offsetHeight;
    canv.width = mainField.offsetWidth;

    stepX = canv.width/fieldSizeX;
    stepY = canv.height/fieldSizeY;
    nextFigureStepX = nextFigure.width/4;
    nextFigureStepY = nextFigure.height/4;

    drawCells();

    if (!isStarted) return;

    drawField();
    drawShadow();
    drawNextFigure();
});

drawCells();
fireworks.run(100);