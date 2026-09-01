import { readFileSync } from "fs";
import YAML from "yaml";

const openApiFile = readFileSync(
  new URL("../docs/openapi.yaml", import.meta.url),
  "utf8"
);

const swaggerDocument = YAML.parse(openApiFile);

export default swaggerDocument;