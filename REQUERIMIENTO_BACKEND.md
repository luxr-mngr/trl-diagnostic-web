# Requerimiento backend — datos para los gráficos de araña por dimensión

## Resumen

La pantalla de resultados muestra **4 gráficos de araña**, uno por dimensión
(`TECHNOLOGICAL`, `LEGAL_REGULATORY`, `COMMERCIAL`, `ORGANIZATIONAL`), con un eje por nivel TRL.

Cuando el usuario **acaba de rendir** la evaluación, el frontend tiene las respuestas en memoria
y los calcula sin problema. Cuando el resultado se recupera con **`POST /results/lookup`**,
la respuesta no trae los datos necesarios y solo se puede mostrar un gráfico reducido.

**Se soluciona agregando un campo a la respuesta de `/results/lookup`.** El frontend ya está
preparado para consumirlo (ver [Solución A](#solución-a--incluir-answers-recomendada)).

---

## El problema

Cada araña necesita, por cada combinación **dimensión × nivel TRL**, el porcentaje cumplido.
Son 4 dimensiones × 9 niveles = **36 valores** (una matriz).

Hoy `/results/lookup` devuelve:

```json
"assessment": {
  "questionnaire_slug": "software",
  "questionnaire_version": 1,
  "created_at": "2026-09-11T02:24:04.718523+00:00",
  "final_trl": null,
  "levels": [
    { "trl": 1, "score": 4.2, "maximum_score": 9.3, "status": "Insuficiente", "chart_value": 2 }
  ],
  "dimensions": [
    { "dimension": "TECHNOLOGICAL", "fulfilled": 24, "total": 49, "percentage": 48.98 }
  ]
}
```

Es decir:

- `levels[]` → 9 valores: el puntaje de cada nivel **sumando todas las dimensiones**.
- `dimensions[]` → 4 valores: el cumplimiento de cada dimensión **sumando todos los niveles**.

Eso son los **totales por fila y por columna** de la matriz, pero **no las celdas**.

### Por qué no se puede deducir

Conocer las sumas de filas y columnas no determina el contenido de las celdas.
Ejemplo mínimo — ambas matrices tienen filas `[10, 10]` y columnas `[10, 10]`:

```
  5   5           10   0
  5   5            0  10
```

Con 4×9 pasa lo mismo: hay muchísimas combinaciones de respuestas que producen
exactamente los mismos `levels[]` y `dimensions[]`. Cualquier valor que el frontend
dibujara ahí sería inventado, así que en ese caso se muestra una sola araña con
`score / maximum_score` por nivel, que sí es dato real.

---

## Solución A — incluir `answers` (recomendada)

Agregar las respuestas crudas dentro de `assessment` en la respuesta de `POST /results/lookup`:

```json
"assessment": {
  "questionnaire_slug": "software",
  "questionnaire_version": 1,
  "created_at": "...",
  "final_trl": null,
  "levels": [ ... ],
  "dimensions": [ ... ],
  "answers": [
    { "question_code": "TRL1.1.S", "complies": true },
    { "question_code": "TRL1.2.S", "complies": false }
  ]
}
```

- Son ~49-50 ítems según el cuestionario (`software` 49, `manufacturing` 48, `medical_device` 50).
- Es exactamente la misma estructura que ya se recibe en `POST /assessments`.
- **El frontend ya lee este campo.** Apenas empiece a llegar, las 4 arañas aparecen
  automáticamente en cualquier dispositivo, sin cambios del lado del cliente.

### Sobre privacidad

La documentación aclara que `/results/lookup` no expone datos personales.
`answers` **no los expone**: no incluye nombre, documento, correo ni rol —
solo qué criterios técnicos del cuestionario se cumplieron.

---

## Solución B — enviar la matriz ya calculada

Si se prefiere no exponer las respuestas individuales, se puede mandar el desglose ya resuelto:

```json
"dimension_levels": [
  { "dimension": "TECHNOLOGICAL", "trl": 1, "score": 4.2, "maximum_score": 6.3 },
  { "dimension": "ORGANIZATIONAL", "trl": 1, "score": 1.8, "maximum_score": 3.0 }
]
```

Son 36 entradas (menos las combinaciones sin preguntas, ver nota más abajo).
Funciona igual de bien, pero **requiere un ajuste en el frontend**, a diferencia de la opción A.

---

## Cómo se calcula cada celda

Para la dimensión `D` y el nivel `L`, usando la definición del propio cuestionario:

1. Tomar las preguntas del nivel `L` cuyo array `dimensions` contiene `D`.
2. `earned` = suma de `base_score_units` de las que el usuario cumplió (`complies: true`).
3. `maximum` = suma de `base_score_units` de **todas** esas preguntas.
4. Valor del eje = `earned / maximum × 100`.

Es la misma fórmula que el frontend aplica hoy tras rendir la evaluación.

### Nota: no todas las dimensiones cubren los 9 niveles

En los tres cuestionarios publicados:

| Dimensión | Niveles con preguntas |
|---|---|
| `TECHNOLOGICAL` | TRL 1-9 (9) |
| `ORGANIZATIONAL` | TRL 1-9 (9) |
| `COMMERCIAL` | TRL 2-9 (8) |
| `LEGAL_REGULATORY` | TRL 2-9 (8) |

Por eso dos de las arañas tienen 8 ejes y no 9. Es correcto, no es un error.
Las combinaciones sin preguntas simplemente se omiten (no se envían como 0).

---

## Impacto actual

Mientras tanto, el frontend guarda las respuestas en `localStorage` al terminar la evaluación
y las reutiliza si se consulta ese mismo código. Pero `localStorage` está **aislado por origen
y por navegador**, así que solo funciona para *el mismo usuario, en el mismo navegador y en el
mismo dominio*.

En la práctica esto significa que **quien reciba un código compartido, o lo abra desde otro
dispositivo, nunca ve las 4 arañas** — que es justamente el caso de uso del código de resultado.

---

## Cómo verificar que quedó resuelto

```bash
curl -s -X POST https://backend-production-8fd6a.up.railway.app/results/lookup \
  -H "Content-Type: application/json" \
  -d '{"code":"C28X77"}' | jq '.assessment | keys'
```

Debería incluir `answers` (opción A) o `dimension_levels` (opción B).

Con la opción A, además: abrir la app en una ventana de incógnito (sin `localStorage`),
consultar un código existente y confirmar que aparecen las 4 arañas en lugar del gráfico único
de "Cumplimiento por nivel TRL".
