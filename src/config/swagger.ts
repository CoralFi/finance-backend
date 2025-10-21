import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';
import { Express } from 'express';

export function setupSwagger(app: Express): void {
  const mainDoc = YAML.load(path.join(__dirname, '../docs/api.yaml'));

  const pathsDir = path.join(__dirname, '../docs');
  const files = fs.readdirSync(pathsDir);

  for (const file of files) {
    if (file.endsWith('.yaml')) {
      const fullPath = path.join(pathsDir, file);
      const doc = YAML.load(fullPath);

      mainDoc.paths = {
        ...mainDoc.paths,
        ...doc,
      };
    }
  }

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mainDoc));
}
