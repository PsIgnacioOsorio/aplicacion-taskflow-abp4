# TaskFlow - Proyecto ABP Módulo 4

Aplicación web tipo To Do List desarrollada con HTML, CSS, Bootstrap 5 y JavaScript ES6.

## Cómo ejecutar

Abre el proyecto con Live Server o con un servidor local. No se recomienda abrir `index.html` con doble clic porque el navegador puede bloquear `fetch("./tareasJson.json")`. También puedes usar el link que se muestra al final o el que aparece fijado en Github.

## Características implementadas

- Crear, editar, cambiar estado y eliminar tareas.
- Clase `Tarea` con `id`, `descripcion`, `estado`, `fechaCreacion` y `fechaLimite`.
- Clase `GestorTareas` para administrar el arreglo de tareas.
- Persistencia con `localStorage`.
- Carga inicial desde `tareasJson.json` usando `fetch()`.
- Carga externa desde JSONPlaceholder usando `fetch()`.
- Simulación de guardado externo con POST a JSONPlaceholder.
- Manejo de errores con `try/catch`.
- Eventos `submit`, `click`, `keyup`, `mouseover` y `mouseout`.
- Simulación de retardo asíncrono al guardar.
- Notificación diferida después de 2 segundos.
- Contador regresivo en tiempo real con `setInterval` para tareas con fecha límite.
- Interfaz basada en Bootstrap 5 con CSS complementario adaptativo.

## Relación con la pauta ABP

### 1. Orientación a objetos en JavaScript

- `Tarea.js` contiene la clase `Tarea`.
- `Tarea` incluye métodos para editar, cambiar estado, finalizar y eliminar.
- `GestionTareas.js` exporta la clase `GestorTareas`, encargada de administrar la lista de tareas.

Ejemplo de instanciación:

```js
const tarea = new Tarea("Copiar el codigo al profe", false, null, null, "2026-07-20");
```

### 2. Características JavaScript ES6+

- Uso de `let` y `const`.
- Uso de clases y módulos con `import` y `export`.
- Uso de arrow functions.
- Uso de template literals.
- Uso de destructuring.
- Uso de spread/rest operators.

### 3. Eventos y manipulación del DOM

- Formulario para agregar y editar tareas.
- Evento `submit` para crear o actualizar tareas.
- Evento `click` para editar, cambiar estado, eliminar, cargar API y restablecer datos.
- Evento `keyup` en descripción y buscador.
- Eventos `mouseover` y `mouseout` sobre filas de la tabla.
- Renderizado dinámico con `createElement`, `append`, `replaceChildren` y `DocumentFragment`.

### 4. JavaScript asíncrono

- Uso de `setTimeout` para mostrar una notificación 2 segundos después de agregar o editar una tarea.
- Simulación de retardo asíncrono con una promesa en `esperar()`.
- Uso de `setInterval` para actualizar el contador regresivo de las tareas con fecha límite.

### 5. Consumo de APIs con JavaScript

- Uso de `fetch()` para cargar datos iniciales desde `tareasJson.json`.
- Uso de `fetch()` para recuperar tareas desde JSONPlaceholder.
- Función `recuperarTareasDesdeAPI()` para obtener tareas externas.
- Función `guardarTareaEnAPI()` para simular almacenamiento externo mediante POST.
- Manejo de errores con `try/catch`.
- Persistencia local con `localStorage`.

## Estructura

```txt
TaskFlow_ABP/
├── index.html
├── tareasJson.json
├── README.md
└── assets
    ├── css
    │   └── style.css
    └── js
        ├── script.js
        └── clases
            ├── GestionTareas.js
            └── Tarea.js
```

## Autor

- Ps. Ignacio Osorio Opazo

### Link de la app web

[Link de aplicación TaskFlow](https://psignacioosorio.github.io/aplicacion-taskflow-abp4/)
