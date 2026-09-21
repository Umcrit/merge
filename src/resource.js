import { Graphics } from 'pixi.js';
import { Item } from './item.js';

// =========================================================
// Ресурс — предмет, который выдаёт генератор
// =========================================================
export class Resource extends Item {
    constructor(level = 1) {
        super(level);
        this.type = 'resource';
    }
    
    // Переопределяем визуал: круг + обводка
    _createVisual() {
        // Круглый фон (вызываем метод родителя для уровня)
        super._createVisual();
        
        // Добавляем обводку
        const border = new Graphics();
        border.circle(0, 0, 45).stroke({ color: 0xffffff, width: 3, alpha: 0.6 });
        this.container.addChild(border);
    }
}