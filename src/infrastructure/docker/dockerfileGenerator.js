import {ApiError} from "../../utils/ApiError.js";


export const generateDockerfile = (stack) => {
    switch (stack) {
        case "node":
            return `
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
`;
        case "python":
            return `
FROM python:3.9
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
`;
        case "go":
            return `
FROM golang:1.18
WORKDIR /app
COPY . .
RUN go build -o main 
CMD ["./main"]
`;
        case "java":
            return `
FROM openjdk:17
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests
CMD ["java", "-jar", "target/app.jar"]
`;
        case "static":
            return `
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
`;
        default:
            throw new ApiError(400, "Unsupported stack detected: " + stack);
    }
}