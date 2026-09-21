import { Graphics, Container } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';

// =========================================================
// 1. ПАРАМЕТРЫ СЕТКИ (внутренние константы)
// =========================================================
export const GRID_COLS    = 7;
export const GRID_ROWS    = 8;
export const CELL_SIZE    = 130;
export const CELL_GAP     = 8;
export const CELL_RADIUS  = 16;

// =========================================================
// 2. ВЫЧИСЛЯЕМ ОБЩИЕ РАЗМЕРЫ СЕТКИ
// =========================================================
const GRID_WIDTH  = GRID_COLS * CELL_SIZE + (GRID_COLS - 1) * CELL_GAP;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE + (GRID_ROWS - 1) * CELL_GAP;

// =========================================================
// 3. ОТСТУПЫ СВЕРХУ И СНИЗУ
// =========================================================
const freeVerticalSpace = GAME_HEIGHT - GRID_HEIGHT;
const GRID_OFFSET_X = Math.floor((GAME_WIDTH - GRID_WIDTH) / 2);
const GRID_OFFSET_Y = Math.floor(freeVerticalSpace * 0.58);

export const GRID_PAD = 16;

// =========================================================
// 4. КЛАСС GRID — инкапсулирует состояние ячеек
// =========================================================
export class Grid {
    constructor() {
        this.cells = Array.from({ length: GRID_ROWS }, () =>
            Array.from({ length: GRID_COLS }, () => null)
        );
    }

    getItem(row, col) {
        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
        return this.cells[row][col];
    }

    setItem(row, col, item) {
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            this.cells[row][col] = item;
        }
    }

    clearCell(row, col) {
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            this.cells[row][col] = null;
        }
    }

    isCellEmpty(row, col) {
        return this.getItem(row, col) === null;
    }

    // Поиск ближайшей пустой клетки с приоритетом направлений
findNearestEmptyCell(row, col) {
    const candidates = [];
    
    // Собираем ВСЕ пустые клетки с их расстоянием
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (this.isCellEmpty(r, c)) {
                const dist = Math.abs(r - row) + Math.abs(c - col);
                
                // Приоритет направления при одинаковом расстоянии:
                // вниз(0) < вправо(1) < влево(2) < вверх(3)
                let directionPriority = 4;
                if (r > row && c === col) directionPriority = 0;      // вниз
                else if (c > col && r === row) directionPriority = 1; // вправо
                else if (c < col && r === row) directionPriority = 2; // влево
                else if (r < row && c === col) directionPriority = 3; // вверх
                
                candidates.push({ row: r, col: c, dist, directionPriority });
            }
        }
    }
    
    // Сортируем: сначала по расстоянию, потом по приоритету направления
    candidates.sort((a, b) => {
        if (a.dist !== b.dist) return a.dist - b.dist;
        return a.directionPriority - b.directionPriority;
    });
    
    return candidates.length > 0 ? candidates[0] : null;
}
}

// =========================================================
// 5. СОЗДАНИЕ ВИЗУАЛА СЕТКИ
// =========================================================
export function createGrid() {
    const gridContainer = new Container();
    gridContainer.x = GRID_OFFSET_X;
    gridContainer.y = GRID_OFFSET_Y;

    // --- 5a. Рамка вокруг всего игрового поля ---
    const pad = GRID_PAD;
    const border = new Graphics();
    border
        .roundRect(-pad, -pad, GRID_WIDTH + pad * 2, GRID_HEIGHT + pad * 2, 24)
        .stroke({ color: 0x4a90d9, width: 6, alpha: 0.8 });
    gridContainer.addChild(border);

    // --- 5b. Подложка под сетку ---
    const backdrop = new Graphics();
    backdrop
        .roundRect(-pad + 2, -pad + 2, GRID_WIDTH + (pad - 2) * 2, GRID_HEIGHT + (pad - 2) * 2, 20)
        .fill({ color: 0x0d1f40, alpha: 0.7 });
    gridContainer.addChild(backdrop);

    // --- 5c. Рисуем клетки ---
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = new Graphics();
            const x = col * (CELL_SIZE + CELL_GAP);
            const y = row * (CELL_SIZE + CELL_GAP);

            cell.roundRect(x, y, CELL_SIZE, CELL_SIZE, CELL_RADIUS).fill(0x152847);
            cell.roundRect(x, y, CELL_SIZE, CELL_SIZE, CELL_RADIUS).stroke({ color: 0x2a4060, width: 2 });
            gridContainer.addChild(cell);
        }
    }

    return gridContainer;
}

// =========================================================
// 6. DEBUG-ЗОНЫ UI
// =========================================================
export function createUIDebugZones() {
    const container = new Container();

    const topHeight = GRID_OFFSET_Y - GRID_PAD;
    const topZone = new Graphics();
    topZone.rect(0, 0, GAME_WIDTH, topHeight).fill({ color: 'white', alpha: 0.4 });
    container.addChild(topZone);

    const bottomY = GRID_OFFSET_Y + GRID_HEIGHT + GRID_PAD;
    const bottomH = GAME_HEIGHT - bottomY;
    const bottomZone = new Graphics();
    bottomZone.rect(0, bottomY, GAME_WIDTH, bottomH).fill({ color: 'white', alpha: 0.4 });
    container.addChild(bottomZone);

    return container;
}

// =========================================================
// 7. ОТОБРАЖЕНИЕ ПРЕДМЕТА В КЛЕТКЕ
// =========================================================
export function getCellCenter(row, col) {
    const x = col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
    const y = row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
    return { x, y };
}