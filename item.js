import { Container, Graphics, Text, TextStyle } from 'pixi.js';

// =========================================================
// Базовый класс предмета
// =========================================================
export class Item {
    constructor(level = 1) {
        this.level = level;
        this.type = 'item'; // базовый тип
        this.container = new Container();
        this.row = -1;
        this.col = -1;
        
        this._createVisual();
    }
    
    // Переопределяется в наследниках
    _createVisual() {
        // По умолчанию — просто круг
        const bg = new Graphics();
        bg.circle(0, 0, 50).fill(this._getColor());
        this.container.addChild(bg);
        
        // Уровень
        const levelText = new Text({
            text: `${this.level}`,
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 36,
                fill: 0xffffff,
                fontWeight: 'bold',
                stroke: { color: 0x000000, width: 3 },
            }),
        });
        levelText.anchor.set(0.5);
        this.container.addChild(levelText);
    }
    
    _getColor() {
        const colors = [
            0xff4444, // уровень 1
            0xff8800, // уровень 2
            0xffcc00, // уровень 3
            0x44ff44, // уровень 4
            0x4488ff, // уровень 5
            0x8844ff, // уровень 6
        ];
        return colors[(this.level - 1) % colors.length];
    }
    
    setPosition(x, y) {
        this.container.x = x;
        this.container.y = y;
    }
    
    setGridPosition(row, col) {
        this.row = row;
        this.col = col;
    }
    // Можно ли слить с другим предметом?
    canMergeWith(other) {
        return other && 
               other.type === this.type && 
               other.level === this.level &&
               other !== this;
    }
}