FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

EXPOSE 8080

COPY target/MyTodoList-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]