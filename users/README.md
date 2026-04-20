# Documentación del API - Juego Y

Esta documentación especifica el funcionamiento del endpoint unificado para la competición entre implementaciones de Yovi. El acceso se realiza directamente al motor de IA, saltando el gateway de seguridad habitual para cumplir con los requisitos de puerto.

## 1. Acceso al motor de bots
El API permite que el sistema de evaluación externo interactúe con la IA enviando el estado actual del tablero y recibiendo una decisión estratégica.

### `GET /play`
Calcula y devuelve el siguiente movimiento del bot o una acción especial basándose en el estado actual del juego enviado en formato YEN.
***Puerto de Acceso: 3002**
**Protocolo: HTTP**
**Parámetros de la URL (Query String):**
* `position` (String JSON, Requerido): El estado actual del tablero en notación YEN. Debe estar correctamente codificado para URL (URL-encoded).
  * `size` (Number): Tamaño del tablero (ej. 4).
  * `turn` (Number): Índice del jugador actual.
  * `players` (Array de Strings): Identificadores de las fichas (ej. `["B", "R"]`).
  * `layout` (String): Disposición actual de las fichas en el tablero.
* `bot_id` (String, Opcional): El identificador de la estrategia que usará la IA. Por defecto es `random_bot`. Opciones válidas: `"random_bot"`, `"monte_carlo_bot"`, `"group_expansion_bot"`, `"priority_block_bot"`, `"shortest_path_bot"`, `"simple_blocker_bot"`, `"triangle_attack_bot"`.

**Ejemplos de interacción (cURL)**
*Petición de movimiento estándar (Windows/CMD):*
```cmd
curl -G "http://localhost:3002/play" --data-urlencode "position={\"size\":3,\"turn\":0,\"players\":[\"B\",\"R\"],\"layout\":\"./B./...\"}"
```
*Petición forzando resign (Tablero Lleno):*
```cmd
curl -G "http://localhost:3002/play" --data-urlencode "position={\"size\":3,\"turn\":0,\"players\":[\"B\",\"R\"],\"layout\":\"B/BR/RBB\"}"
```
**Formatos de respuesta**
El API devolverá uno de los siguientes objetos JSON según el estado del juego:
*A. Movimiento realizado (Coordenadas)*
```json
{
  "coords": {
    "x": 1,
    "y": 1,
    "z": 0
  }
}
```
*B. Resign*
Se devuelve automáticamente si la IA determina que no hay movimientos válidos posibles o el tablero está completo.
```json
{
  "action": "resign"
}
```