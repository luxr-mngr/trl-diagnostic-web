# Integración Frontend

## Entorno de integración

```text
Base URL: https://backend-production-8fd6a.up.railway.app
```

La API pública no requiere login. El formulario recopila datos del proyecto y exige consentimiento, pero la identidad no se expone en la consulta pública de resultados.

El dashboard administrativo usa rutas separadas bajo `/admin/*` y requiere
autenticación administrativa. Actualmente el backend valida un token enviado
como `Authorization: Bearer <ADMIN_API_TOKEN>`. No incluir este token en una
SPA: el dashboard debe llamar a un backend/BFF seguro o se debe reemplazar
esta protección temporal por el proveedor de identidad elegido.

## Flujo recomendado

1. Registrar los datos del proyecto con `POST /projects`.
2. Consultar `GET /project-roles` para cargar el select de rol del proyecto.
3. Consultar `GET /questionnaires` para mostrar los cuestionarios disponibles.
4. Consultar `GET /questionnaires/{slug}` para obtener sus niveles, preguntas y rangos.
5. Renderizar las preguntas de `levels[].questions[]`.
6. Enviar todas las respuestas con `POST /assessments`, incluyendo `project_id`.
7. Mostrar `final_trl`, el estado de cada nivel, el resumen por dimensión y `result_code`.

## Cuestionarios disponibles

| `slug` | Preguntas |
|---|---:|
| `software` | 49 |
| `manufacturing` | 48 |
| `medical_device` | 50 |

## `GET /health`

Verifica que la API esté disponible.

Respuesta `200`:

```json
{
  "status": "ok"
}
```

## `GET /project-roles`

Devuelve los roles válidos para el proyecto. El frontend debe cargar este endpoint antes de renderizar o habilitar el select.

Respuesta `200`:

```json
[
  "Director",
  "Investigador",
  "Gestor tecnológico"
]
```

Ejemplo mínimo:

```js
const response = await fetch(`${API_BASE_URL}/project-roles`);
const roles = await response.json();

roles.forEach((role) => {
  const option = document.createElement("option");
  option.value = role;
  option.textContent = role;
  roleSelect.appendChild(option);
});
```

Al enviar `POST /projects`, usar exactamente el texto seleccionado en `project_role`. La API responde `422` si el valor no es uno de los roles publicados.

## `GET /questionnaires`

Devuelve el resumen de los catálogos publicados.

Respuesta `200`:

```json
[
  {
    "slug": "software",
    "version": 1,
    "question_count": 49
  }
]
```

## `GET /questionnaires/{slug}`

Valores válidos para `slug`: `software`, `manufacturing`, `medical_device`.

Respuesta `200`:

```json
{
  "slug": "software",
  "version": 1,
  "weights": {
    "stage": 4,
    "priority": 6
  },
  "levels": [
    {
      "trl": 1,
      "title": "...",
      "classification_bands": [
        {
          "status": "No cumple",
          "chart_value": 1,
          "min_score_units": 0,
          "max_score_units": 22
        }
      ],
      "questions": [
        {
          "code": "TRL1.1.S",
          "text": "...",
          "stage": "INICIO / BASICO",
          "priority": "Alta",
          "base_score_units": 22,
          "dimensions": ["TECHNOLOGICAL"]
        }
      ]
    }
  ]
}
```

El frontend debe usar `code` como identificador estable de la pregunta. `base_score_units` está expresado en décimas: `22` equivale a `2.2` puntos.

Estados posibles de un nivel:

```text
No cumple
Insuficiente
En proceso
Cumplido
```

Dimensiones posibles:

```text
TECHNOLOGICAL
LEGAL_REGULATORY
COMMERCIAL
ORGANIZATIONAL
```

## `POST /projects`

Registra los datos del proyecto antes de iniciar el cuestionario. Todos los campos son obligatorios y `consent_accepted` debe ser `true`.

Request:

```json
{
  "full_name": "Nombre Apellido",
  "identification_type": "DNI",
  "identification_number": "12345678",
  "email": "persona@example.com",
  "project_role": "Investigador principal",
  "organization": "Organización",
  "proposal_title": "Título de propuesta",
  "sector": "Salud",
  "project_summary": "Resumen del proyecto",
  "consent_accepted": true
}
```

Respuesta `201`:

```json
{
  "project_id": "uuid"
}
```

El `project_id` debe conservarse en el estado del formulario para asociarlo a la evaluación.

## `POST /assessments`

Procesa y guarda una evaluación asociada a un proyecto.

Request:

```json
{
  "project_id": "uuid",
  "questionnaire_slug": "software",
  "questionnaire_version": 1,
  "answers": [
    {
      "question_code": "TRL1.1.S",
      "complies": true
    },
    {
      "question_code": "TRL1.2.S",
      "complies": false
    }
  ]
}
```

Reglas del request:

- Debe enviarse la versión activa del cuestionario.
- Debe enviarse una respuesta para cada pregunta.
- No se permiten preguntas desconocidas.
- No se permiten códigos duplicados.
- `complies` debe ser booleano.
- No enviar el texto de la pregunta ni calcular puntajes en el frontend.

Respuesta `201`:

```json
{
  "assessment_id": "uuid",
  "result_code": "K7P4XM",
  "questionnaire_slug": "software",
  "questionnaire_version": 1,
  "final_trl": 4,
  "levels": [
    {
      "trl": 1,
      "score": 8.2,
      "maximum_score": 9.6,
      "status": "Cumplido",
      "chart_value": 4
    }
  ],
  "dimensions": [
    {
      "dimension": "TECHNOLOGICAL",
      "fulfilled": 35,
      "total": 49,
      "percentage": 71.43
    }
  ]
}
```

`final_trl` puede ser `null`. El TRL final se obtiene por cumplimiento consecutivo desde TRL 1: si un nivel no queda `Cumplido`, los niveles posteriores no elevan el TRL final.

## `POST /results/lookup`

Consulta un resultado anterior usando el código de seis caracteres. No requiere autenticación y devuelve únicamente información no personal del proyecto.

Request:

```json
{
  "code": "K7P4XM"
}
```

La búsqueda no distingue mayúsculas y minúsculas. La respuesta incluye `organization`, `proposal_title`, `sector`, `project_summary` y los resultados de la evaluación, pero no incluye nombre, documento, correo ni rol.

La respuesta incluye `Cache-Control: no-store`.

## Errores

| HTTP | Situación |
|---:|---|
| `404` | Proyecto o resultado inexistente |
| `404` | Cuestionario inexistente |
| `409` | Versión no activa |
| `422` | Respuestas faltantes, desconocidas, duplicadas o inválidas |
| `429` | Se superó el límite de solicitudes |

Ejemplo de error por límite:

```json
{
  "detail": "Too many assessment requests"
}
```

La respuesta `429` incluye el header `Retry-After`.

## Ejemplo con `fetch`

```ts
const baseUrl = "https://backend-production-8fd6a.up.railway.app";

const questionnaire = await fetch(`${baseUrl}/questionnaires/software`)
  .then((response) => response.json());

const project = await fetch(`${baseUrl}/projects`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(projectForm),
}).then((response) => response.json());

const answers = questionnaire.levels.flatMap((level: any) =>
  level.questions.map((question: any) => ({
    question_code: question.code,
    complies: Boolean(selectedAnswers[question.code]),
  })),
);

const result = await fetch(`${baseUrl}/assessments`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    project_id: project.project_id,
    questionnaire_slug: questionnaire.slug,
    questionnaire_version: questionnaire.version,
    answers,
  }),
}).then((response) => response.json());
```

## Rate limit

El entorno de integración permite por defecto 30 solicitudes a `POST /projects` y `POST /assessments` por IP cada 60 segundos, y 20 consultas a `POST /results/lookup` por IP cada 60 segundos. Estos límites existen para evitar abuso accidental y pueden cambiar en Railway mediante:

```text
ASSESSMENT_RATE_LIMIT
ASSESSMENT_RATE_WINDOW_SECONDS
RESULT_LOOKUP_RATE_LIMIT
RESULT_LOOKUP_RATE_WINDOW_SECONDS
```
