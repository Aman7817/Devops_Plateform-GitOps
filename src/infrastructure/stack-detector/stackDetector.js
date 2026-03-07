import fs from "fs";
import path from "path";

export const detectStack = async (projectPath) => {
    const files = fs.readdirSync(projectPath);

    if(files.includes("package.json")) {
        return "node";
    }

    if(files.includes("requirements.txt")) {
        return "python";
    }

    if(files.includes("go.mod")) {
        return "go";
    }

    if(files.includes("pom.xml")) {
        return "java";
    }

    if(files.includes("index.html")) {
        return "static";
    }

    

    return "unknown";
}