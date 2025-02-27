# Wiremax Commissions - Frontend



## Contenido

- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de configuración](#variables-de-configuración)
- [Cómo usar Docker](#cómo-usar-docker)
- [Pull Requests](#pull-requests)

## Tecnologías utilizadas

- [React](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [Material UI](https://mui.com/)
- [Node / npm (para la instalación de dependencias y scripts)](https://nodejs.org/)

## Estructura del proyecto

wiremax-commissions 
├── public 
├── src 
│ ├── config 
│ ├── context 
│ ├── services 
│ ├── pages 
│ ├── components 
│ ├── App.js 
│ ├── index.js 
│ └── index.css 
├── .gitignore 
├── Dockerfile 
├── package.json 
└── README.md


## Requisitos previos

- **Node.js** >= 14
- **npm** >= 6

## Instalación y ejecución

1. Clonar el repositorio
2. Instalar dependencias:
    npm install
3. Ejecutar en modo desarrollo:
    npm start
4. La aplicación estará disponible en http://localhost:3000.

## Variables de configuración
En src/config/appConfig.js se define la URL base de la API (por ejemplo, http://localhost:3001).
Cuando se despliegue a producción, ajusta esta variable según corresponda
