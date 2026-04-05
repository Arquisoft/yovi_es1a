import { describe, test, expect } from 'vitest';
import { stringToYenLayout, coordsToIndex, getInitialLayout } from './tablero.utils';

describe('tablero.utils', () => {
  describe('stringToYenLayout', () => {
    test('convierte correctamente un tablero de tamaño 2', () => {
      // Un tablero de tamaño 2 tiene 3 celdas (1 en la primera fila, 2 en la segunda)
      // Flat: "B.R" -> Yen: "B/.R"
      expect(stringToYenLayout("B.R", 2)).toBe("B/.R");
    });

    test('convierte correctamente un tablero de tamaño 3', () => {
      // Un tablero de tamaño 3 tiene 6 celdas
      // Flat: "B.R..B" -> Yen: "B/.R/..B"
      expect(stringToYenLayout("B.R..B", 3)).toBe("B/.R/..B");
    });
  });

  describe('coordsToIndex', () => {
    test('calcula correctamente el índice para tamaño 3', () => {
      // Tablero de tamaño 3:
      // Fila 0 (x=2): 1 elemento -> índice 0
      // Fila 1 (x=1): 2 elementos -> índices 1, 2
      // Fila 2 (x=0): 3 elementos -> índices 3, 4, 5
      
      // La punta de arriba del todo (x=2, y=0)
      expect(coordsToIndex(2, 0, 3)).toBe(0);
      
      // Abajo a la izquierda (x=0, y=0)
      expect(coordsToIndex(0, 0, 3)).toBe(3);
      
      // Abajo a la derecha (x=0, y=2)
      expect(coordsToIndex(0, 2, 3)).toBe(5);
    });

    test('calcula correctamente el índice para tamaño 5', () => {
      // Abajo a la derecha en tamaño 5 (x=0, y=4) -> debería ser la celda 14
      expect(coordsToIndex(0, 4, 5)).toBe(14);
    });
  });

  describe('getInitialLayout', () => {
    test('genera puntos correctos para tamaño 1', () => {
      expect(getInitialLayout(1)).toBe(".");
    });

    test('genera puntos correctos para tamaño 3 (6 casillas)', () => {
      expect(getInitialLayout(3)).toBe("......");
    });

    test('genera puntos correctos para tamaño 5 (15 casillas)', () => {
      expect(getInitialLayout(5)).toBe("...............");
    });
  });
});