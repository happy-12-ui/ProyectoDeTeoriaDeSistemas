# Proyecto Final :) - Motor de Visualización DFA

Este proyecto es una aplicación web interactiva diseñada para visualizar y simular Autómatas Finitos Deterministas (DFA). Permite a los usuarios experimentar con dos ejercicios clásicos de teoría de la computación: validación de correos electrónicos y cálculo de módulo 3.

## 📋 Características

-   **Interfaz Moderna**: Diseño "Glassmorphism Sci-Fi" con animaciones fluidas.
-   **Visualización en Tiempo Real**: Gráficos dinámicos que muestran los estados y transiciones mientras se procesa la entrada.
-   **Feedback Detallado**: El sistema explica exactamente por qué una cadena es aceptada o rechazada (ej. "Rechazado porque la suma de dígitos es 5").
-   **Gramática Dinámica**: Muestra la gramática regular equivalente para el autómata activo.
-   **Totalmente en Español**: Toda la interfaz y los mensajes del sistema están localizados al español.

---

## 🚀 Guía de Instalación y Ejecución

Este proyecto está construido con tecnologías web estándar (HTML, CSS, JavaScript) y no requiere instalación de software complejo ni servidores backend.

### Opción 1: Ejecución Local (Desde los archivos)

Esta es la forma más sencilla de probar el proyecto si tienes los archivos descargados en tu computadora.

1.  **Descargar/Ubicar la carpeta**: Asegúrate de tener la carpeta del proyecto (que contiene `index.html`, `style.css`, y `script.js`).
2.  **Abrir el archivo principal**:
    *   Navega dentro de la carpeta del proyecto.
    *   Busca el archivo llamado `index.html`.
    *   Haz **doble clic** sobre él.
3.  **Navegador**: El proyecto se abrirá automáticamente en tu navegador web predeterminado (Chrome, Edge, Firefox, etc.).
    *   *Nota: Si no se abre, haz clic derecho en `index.html` -> "Abrir con" -> Selecciona tu navegador preferido.*

### Opción 2: Ver en GitHub (Si está publicado)

Si este proyecto está alojado en un repositorio de GitHub, puedes acceder al código o a la versión en vivo.

1.  **Acceder al Repositorio**: Visita el enlace del repositorio proporcionado (ej. `https://github.com/tu-usuario/proyecto-dfa`).
2.  **Ver el Código**: Puedes navegar por los archivos directamente en la interfaz de GitHub.
3.  **Ejecutar Online (GitHub Pages)**:
    *   Si GitHub Pages está activado, busca el enlace en la sección "Environments" o en la descripción del repositorio (usualmente se ve como `https://tu-usuario.github.io/proyecto-dfa/`).
    *   Haz clic en el enlace para usar la aplicación directamente en la web sin descargar nada.

---

## 📖 Cómo Usar la Aplicación

1.  **Seleccionar Módulo**: Usa los botones en la parte superior derecha para cambiar entre "Ejercicio 1: Email" y "Ejercicio 2: Módulo 3".
2.  **Ingresar Cadena**: Escribe el texto que deseas validar en el campo de entrada central.
3.  **Validar**:
    *   **Botón "Validar"**: Verifica la cadena instantáneamente y muestra el resultado.
    *   **Botón "Animar"**: Reproduce paso a paso cómo el autómata procesa cada carácter.
4.  **Ver Resultados**:
    *   El **Indicador de Estado** (círculo grande) te dirá si fue ACEPTADA o RECHAZADA.
    *   El **Registro del Sistema** (panel inferior) te dará una explicación detallada y técnica del resultado.

## 🛠️ Tecnologías Utilizadas

-   **HTML5**: Estructura semántica.
-   **CSS3**: Estilos avanzados, efectos de neón y diseño responsivo.
-   **JavaScript (ES6+)**: Lógica de los autómatas, renderizado en Canvas y manipulación del DOM.

---

**Desarrollado para el Proyecto Final de Teoría de la Computación.**
