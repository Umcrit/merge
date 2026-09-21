import { getCellCenter, GRID_COLS, GRID_ROWS, CELL_SIZE, CELL_GAP } from './grid.js';
import { mergeItems } from './merge.js';

const CLICK_THRESHOLD = 8;

// =========================================================
// DRAG MANAGER — единый менеджер для всех перетаскиваний
// =========================================================
export class DragManager {
    constructor(app, grid, itemsLayer) {
        this.app = app;
        this.grid = grid;
        this.itemsLayer = itemsLayer;

        this.activeItem = null;
        this.isDragging = false;
        this.hasMoved = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        // Включаем обработку событий для stage ОДИН РАЗ
        this.app.stage.eventMode = 'static';

        // Регистрируем глобальные обработчики ОДИН РАЗ
        this.app.stage.on('pointermove', this._onPointerMove.bind(this));
        this.app.stage.on('pointerup', this._onPointerUp.bind(this));
        this.app.stage.on('pointerupoutside', this._onPointerUp.bind(this)); // ← Исправление бага
        this.app.stage.on('pointercancel', this._onPointerUp.bind(this));   // ← Исправление бага
    }

    // Регистрация предмета для drag-and-drop
    registerItem(item, onClick = null) {
        item.container.eventMode = 'static';
        item.container.cursor = 'pointer';
        item._onClick = onClick; // Сохраняем callback на самом предмете

        item.container.on('pointerdown', (e) => this._onPointerDown(item, e));
    }

    _onPointerDown(item, e) {
        this.activeItem = item;
        this.isDragging = true;
        this.hasMoved = false;

        this.dragStartX = e.global.x;
        this.dragStartY = e.global.y;

        const localPos = this.itemsLayer.toLocal(e.global);
        this.dragOffsetX = localPos.x - item.container.x;
        this.dragOffsetY = localPos.y - item.container.y;

        // Поднимаем предмет наверх в itemsLayer
        this.itemsLayer.setChildIndex(item.container, this.itemsLayer.children.length - 1);

        e.stopPropagation();
    }

    _onPointerMove(e) {
        if (!this.isDragging || !this.activeItem) return;

        const dx = e.global.x - this.dragStartX;
        const dy = e.global.y - this.dragStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!this.hasMoved && distance > CLICK_THRESHOLD) {
            this.hasMoved = true;
        }

        if (this.hasMoved) {
            const localPos = this.itemsLayer.toLocal(e.global);
            this.activeItem.container.x = localPos.x - this.dragOffsetX;
            this.activeItem.container.y = localPos.y - this.dragOffsetY;
        }
    }

    _onPointerUp(e) {
        if (!this.isDragging || !this.activeItem) return;

        const item = this.activeItem;
        this.isDragging = false;
        this.activeItem = null;

        // Если мышь не двигалась — это клик
        if (!this.hasMoved && item._onClick) {
            item._onClick(item, e); // ← Передаём сам предмет в callback
            return;
        }

        // Иначе — это drag, привязываем к клетке
        const localPos = this.itemsLayer.toLocal(e.global);
        const col = Math.round((localPos.x - CELL_SIZE / 2) / (CELL_SIZE + CELL_GAP));
        const row = Math.round((localPos.y - CELL_SIZE / 2) / (CELL_SIZE + CELL_GAP));

        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            const targetItem = this.grid.getItem(row, col);

            if (targetItem && targetItem !== item && item.canMergeWith(targetItem)) {
                // === СЛИЯНИЕ ===
                console.log(`Слияние: уровень ${item.level} + ${targetItem.level} = ${item.level + 1}`);

                const merged = mergeItems(item, targetItem, row, col);

                // Очищаем старые клетки
                this.grid.clearCell(item.row, item.col);
                this.grid.clearCell(targetItem.row, targetItem.col);

                // Уничтожаем старые визуалы
                item.container.destroy();
                targetItem.container.destroy();

                // Добавляем новый предмет
                this.itemsLayer.addChild(merged.container);
                this.grid.setItem(row, col, merged);

                // Регистрируем drag для нового предмета
                const newOnClick = merged.type === 'generator' ? item._onClick : null;
                this.registerItem(merged, newOnClick);

                return;
            }

            // Обычное перемещение
            // Обычное перемещение (клетка пустая или отпустили в своей же клетке)
            if (targetItem === null || targetItem === item) {
                const cellCenter = getCellCenter(row, col);
                item.setPosition(cellCenter.x, cellCenter.y);
                item.setGridPosition(row, col);
                // cells[row][col] уже ссылается на item (или был null) — обновляем для надёжности
                this.grid.setItem(row, col, item);
            } else {
                // Клетка занята — возвращаем на место
                const oldCellCenter = getCellCenter(item.row, item.col);
                item.setPosition(oldCellCenter.x, oldCellCenter.y);
            }
        } else {
            // Отпустили вне поля — возвращаем на место
            const oldCellCenter = getCellCenter(item.row, item.col);
            item.setPosition(oldCellCenter.x, oldCellCenter.y);
        }
    }
}