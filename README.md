# Thrifty Tally

**Organiza tus necesidades, controla tu futuro.**

## 1. Descripción del proyecto

Thrifty Tally es una aplicación web diseñada para ayudar a las personas a organizar sus necesidades económicas, administrar sus presupuestos y realizar un seguimiento de sus gastos durante diferentes períodos de tiempo.

La aplicación permite llevar un control de los recursos disponibles, registrar necesidades y consultar el comportamiento de los gastos, facilitando la toma de decisiones financieras y promoviendo una mejor administración del dinero.

Está dirigida a estudiantes universitarios, trabajadores y personas naturales que buscan mejorar la organización de sus finanzas personales.

## 2. Objetivo del proyecto

Desarrollar una herramienta tecnológica que facilite la planificación y el control de las finanzas personales mediante la administración de presupuestos, necesidades y períodos de consumo, permitiendo identificar los gastos y mejorar el aprovechamiento de los recursos económicos.

## 3. Funcionalidades principales

- **Autenticación de usuarios:** inicio de sesión y protección de acceso mediante JWT.
- **Gestión de usuarios:** registro y administración de cuentas.
- **Gestión de presupuestos:** creación y administración de presupuestos disponibles.
- **Gestión de necesidades:** registro y clasificación de necesidades económicas.
- **Control de períodos:** organización de los gastos en diferentes períodos de tiempo.
- **Seguimiento de gastos:** consulta de los valores registrados y control del consumo presupuestario.
- **Validación presupuestaria:** comprobación de los gastos frente al presupuesto disponible.

## 4. Tecnologías utilizadas

### Backend
- Java.
- Spring Boot.
- Spring Security.
- JSON Web Token (JWT).
- Maven.
- MongoDB.

### Frontend
- React.
- Vite.
- JavaScript.
- CSS.

### Base de datos
- MongoDB Atlas.

### Herramientas de desarrollo
- IntelliJ IDEA.
- Visual Studio Code.
- Postman.
- Git y GitHub.

## 5. Requisitos previos

Para ejecutar el proyecto localmente es necesario contar con:

- Java JDK 17 o la versión compatible configurada en el proyecto.
- Maven (o Maven Wrapper incluido en el repositorio).
- Node.js y npm.
- Una cuenta o instancia de MongoDB Atlas.
- Git.
- Un editor de código como IntelliJ IDEA o Visual Studio Code.

## 6. Instalación del proyecto

### 6.1. Clonar el repositorio

Abrir una terminal y ejecutar:

```bash
git clone https://github.com/serverus1324/Thristy_Tally.git
```

Ingresar a la carpeta del proyecto:

```bash
cd Thristy_Tally
```

### 6.2. Configuración del Backend

Ingresar a la carpeta del backend:

```bash
cd CalcGastosU
```

Configurar las variables de entorno necesarias para la conexión con MongoDB Atlas y la autenticación JWT.

Crear un archivo `.env` a partir del archivo `.env.example`, si está disponible:

```bash
cp .env.example .env
```

Editar el archivo `.env` y completar los valores correspondientes con las credenciales propias.

**Importante:** no compartir ni subir el archivo `.env` al repositorio.

Verificar que la configuración de Spring Boot utilice las variables de entorno correspondientes.

### 6.3. Instalación de dependencias del Backend

Si el proyecto cuenta con Maven Wrapper, ejecutar:

En Windows:

```bash
mvnw.cmd clean install
```

En Linux o macOS:

```bash
./mvnw clean install
```

También se puede utilizar Maven instalado globalmente:

```bash
mvn clean install
```

### 6.4. Ejecución del Backend

Desde la carpeta `CalcGastosU`, ejecutar:

En Windows:

```bash
mvnw.cmd spring-boot:run
```

En Linux o macOS:

```bash
./mvnw spring-boot:run
```

El servidor estará disponible en:

```text
http://localhost:8081
```

### 6.5. Configuración del Frontend

Abrir una segunda terminal y regresar a la carpeta principal del proyecto. Luego ingresar al frontend:

```bash
cd calc-gastos-front
```

Instalar las dependencias:

```bash
npm install
```

Configurar las variables de entorno necesarias para establecer la comunicación con el backend. Si se utiliza un archivo `.env.example`, crear el archivo `.env` correspondiente y completar los valores.

### 6.6. Ejecución del Frontend

Ejecutar el siguiente comando:

```bash
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

## 7. Configuración de la base de datos

El proyecto utiliza MongoDB como sistema de gestión de base de datos.

Para ejecutar correctamente la aplicación se requiere:

1. Crear una cuenta en MongoDB Atlas.
2. Crear un clúster de base de datos.
3. Crear un usuario de base de datos.
4. Configurar los permisos de acceso necesarios.
5. Obtener la cadena de conexión.
6. Configurar la cadena de conexión en las variables de entorno del backend.

La base de datos utilizada por el proyecto se identifica como `CalcGastosU`.

Las credenciales deben ser proporcionadas por cada persona que configure el proyecto.

## 8. Variables de entorno

El proyecto utiliza variables de entorno para mantener separadas las configuraciones sensibles del código fuente.

Se deben configurar los valores correspondientes para:

- URI de conexión a MongoDB.
- Clave secreta para la generación y validación de tokens JWT.
- Puerto de ejecución del servidor.
- Dirección de comunicación entre frontend y backend, cuando corresponda.

Los archivos de ejemplo deben contener únicamente valores ilustrativos y nunca credenciales reales.

## 9. Estructura general del proyecto

```text
Thristy_Tally/
│
├── CalcGastosU/
│   ├── src/
│   ├── pom.xml
│   └── .env.example
│
├── calc-gastos-front/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

*Nota: la estructura representa la organización general del proyecto. Puede variar según los archivos y configuraciones presentes en cada versión.*

## 10. Seguridad

Thrifty Tally implementa autenticación mediante JSON Web Token (JWT) para gestionar el acceso de los usuarios.

Para proteger la información y las credenciales del proyecto se deben tener en cuenta las siguientes recomendaciones:

- No publicar contraseñas de MongoDB.
- No subir archivos `.env` con información sensible.
- No compartir claves secretas JWT.
- Utilizar archivos de configuración de ejemplo.
- Mantener las credenciales fuera del código fuente.

## 11. Ejecución de la aplicación

Para utilizar Thrifty Tally localmente es necesario iniciar los dos componentes:

1. Iniciar el backend de Spring Boot.
2. Iniciar el frontend de React mediante Vite.
3. Verificar que ambos componentes tengan configurada correctamente su comunicación.
4. Acceder desde el navegador a `http://localhost:5173`.

## 12. Propósito académico y desarrollo

Thrifty Tally es un proyecto de desarrollo de software que integra tecnologías web modernas y herramientas de gestión de bases de datos para ofrecer una solución orientada a la organización de las finanzas personales.

Su desarrollo contempla aspectos como arquitectura cliente-servidor, autenticación, persistencia de información, validación de datos y administración de presupuestos.

## 13. Autoría

**Proyecto:** Thrifty Tally  
**Repositorio:** https://github.com/serverus1324/Thristy_Tally

