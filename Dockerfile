# Etapa de build
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app
COPY . .

# Dar permisos a gradlew y corregir posibles saltos de línea
RUN chmod +x gradlew

# Construir el proyecto sin tests
RUN ./gradlew clean build -x test

# Etapa de runtime
FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
