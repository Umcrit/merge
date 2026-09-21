import { Generator } from './generator.js';
import { Resource } from './resource.js';
import { getCellCenter } from './grid.js';

// =========================================================
// Слияние двух предметов
// =========================================================
// row, col — координаты целевой ячейки, где появится новый предмет
export function mergeItems(item1, item2, row, col) {
    const ItemClass = item1.type === 'generator' ? Generator : Resource;
    const merged = new ItemClass(item1.level + 1);
    
    // Позиционируем в центре целевой ячейки
    const center = getCellCenter(row, col);
    merged.setPosition(center.x, center.y);
    merged.setGridPosition(row, col);
    
    return merged;
}