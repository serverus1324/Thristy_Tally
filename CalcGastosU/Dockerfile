# Etapa 1: Compilación usando Java 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Copiamos el pom.xml y el código fuente
COPY pom.xml .
COPY src ./src
# Compilamos el proyecto (saltando las pruebas para que sea más rápido)
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución usando Java 17
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copiamos el .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Comando para arrancar tu backend
ENTRYPOINT ["java", "-jar", "app.jar"]