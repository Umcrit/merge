import { Application, Graphics, Container } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { createGrid, createUIDebugZones, Grid, getCellCenter } from './grid.js';
import { Generator } from './generator.js';
import { DragManager } from './drag.js';
import { Resource } from './resource.js';

// =========================================================
// 1. СОЗДАНИЕ PIXI-ПРИЛОЖЕНИЯ
// =========================================================
const app = new Application();
await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    background: 0x0a1a3a,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
});

// =========================================================
// 2. PIXIJS DEVTOOLS
// =========================================================
globalThis.__PIXI_APP__ = app;
document.getElementById('game-container').appendChild(app.canvas);

// =========================================================
// 3. ФОН ВИРТУАЛЬНОГО ОКНА
// =========================================================
const background = new Graphics();
background.rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill(0x0a1a3a);
app.stage.addChild(background);

// =========================================================
// 4. DEBUG-ЗОНЫ UI
// =========================================================
const uiZones = createUIDebugZones();
app.stage.addChild(uiZones);

// =========================================================
// 5. СЕТКА (визуал + логика)
// =========================================================
const gridContainer = createGrid();
app.stage.addChild(gridContainer);

const grid = new Grid(); // ← Экземпляр класса Grid

// =========================================================
// 6. СЛОЙ ДЛЯ ИНТЕРАКТИВНЫХ ПРЕДМЕТОВ
// =========================================================

// Добавляем itemsLayer внутрь gridContainer —
// тогда предметы автоматически следуют за сеткой
const itemsLayer = new Container();
gridContainer.addChild(itemsLayer);

// =========================================================
// 7. DRAG MANAGER
// =========================================================
const dragManager = new DragManager(app, grid, itemsLayer);

// =========================================================
// 8. СОЗДАЁМ ГЕНЕРАТОР
// =========================================================
const generator = new Generator(1);
const startRow = 3;
const startCol = 3;
const cellCenter = getCellCenter(startRow, startCol);
generator.setPosition(cellCenter.x, cellCenter.y);
generator.setGridPosition(startRow, startCol);

itemsLayer.addChild(generator.container);
grid.setItem(startRow, startCol, generator);

// Настраиваем drag-and-drop + обработчик клика
dragManager.registerItem(generator, (item, e) => {
    // ← Теперь callback получает сам предмет
    const target = grid.findNearestEmptyCell(item.row, item.col);
    
    if (target) {
        const resource = new Resource(1);
        const resCenter = getCellCenter(target.row, target.col);
        resource.setPosition(resCenter.x, resCenter.y);
        resource.setGridPosition(target.row, target.col);
        
        itemsLayer.addChild(resource.container);
        grid.setItem(target.row, target.col, resource);
        
        dragManager.registerItem(resource, null);
        console.log(`Ресурс создан в клетке [${target.row}][${target.col}]`);
    } else {
        console.log('Нет свободных клеток!');
    }
});

// =========================================================
// 9. РЕСАЙЗ (FIT-стратегия)
// =========================================================
function resize() {
    const realW = window.innerWidth;
    const realH = window.innerHeight;
    const scale = Math.min(realW / GAME_WIDTH, realH / GAME_HEIGHT);
    app.canvas.style.width = `${GAME_WIDTH * scale}px`;
    app.canvas.style.height = `${GAME_HEIGHT * scale}px`;
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);