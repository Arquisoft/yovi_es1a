# Documentación del API - Juego Y

El backend de esta aplicación expone un API REST para interactuar con el motor del juego (IA) y para gestionar la información y estadísticas de los usuarios a través de un Gateway seguro (Nginx).

Nota sobre Seguridad Local: Dado que el entorno utiliza certificados autofirmados, 
es necesario añadir el flag -k o --insecure para omitir la validación de la autoridad certificadora en la terminal.
## 1. Motor de Inteligencia Artificial (Bots)
El API permite que un sistema externo interactúe con nuestra IA enviando el estado actual del tablero y seleccionando una estrategia.

### `GET /api/bot/play`
Calcula y devuelve las coordenadas del siguiente movimiento del bot basándose en el estado actual del juego.
**Parámetros de la URL (Query String):**
* `position` (String JSON, Requerido): El estado actual del tablero estructurado para la notación YEN, convertido a string.
  * `size` (Number): Tamaño del tablero (ej. 4).
  * `turn` (Number): Índice del jugador actual.
  * `players` (Array de Strings): Identificadores de las fichas (ej. `["B", "R"]`).
  * `layout` (String): Disposición actual de las fichas en el tablero.
* `bot_id` (String, Opcional): El identificador de la estrategia que usará la IA. Por defecto es `random_bot`. Opciones válidas: `"random_bot"`, `"monte_carlo_bot"`, `"group_expansion_bot"`, `"priority_block_bot"`, `"shortest_path_bot"`, `"simple_blocker_bot"`, `"triangle_attack_bot"`.
* `api_version` (String, Opcional): Versión del API (ej. `"v1"`).

**Ejemplo de Petición (cURL para Windows CMD):**
```cmd
curl -k -G "https://localhost/api/bot/play" --data-urlencode "position={\"size\":4, \"turn\":1, \"players\":[\"B\",\"R\"], \"layout\":\"./../.B./....\"}" --data-urlencode "bot_id=monte_carlo_bot" --data-urlencode "api_version=v1"
```

**Ejemplo de Respuesta (cURL):**
```json
{
  "x": 1,
  "y": 0,
  "z": 2
}
```