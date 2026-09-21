import { Graphics, Text, TextStyle } from 'pixi.js';
import { Item } from './item.js';

// =========================================================
// Генератор — предмет, который выдаёт ресурсы
// =========================================================
export class Generator extends Item {
    constructor(level = 1) {
        super(level); // вызываем конструктор родителя
        this.type = 'generator'; // переопределяем тип
    }
    
    // Переопределяем визуал: квадрат + буква "G"
    _createVisual() {
        // Квадратный фон
        const bg = new Graphics();
        bg.roundRect(-55, -55, 110, 110, 16).fill(this._getColor());
        this.container.addChild(bg);
        
        // Иконка "G"
        const icon = new Text({
            text: 'G',
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 48,
                fill: 0xffffff,
                fontWeight: 'bold',
            }),
        });
        icon.anchor.set(0.5);
        icon.y = -10;
        this.container.addChild(icon);
        
        // Уровень
        const levelText = new Text({
            text: `${this.level}`,
            style: new TextStyle({
                fontFamily: 'Arial',
                fontSize: 28,
                fill: 0xffffff,
            }),
        });
        levelText.anchor.set(0.5);
        levelText.y = 25;
        this.container.addChild(levelText);
    }
}   