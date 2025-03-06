// generator sets values set by an anyOf discriminator as strings rather than enum, this corrects that
import * as fs from 'node:fs';

const modelLocation = './src/types/generated/models';

const fileList = fs.readdirSync(modelLocation);

for (const fileName of fileList) {
  const path = `${modelLocation}/${fileName}`;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileContent = fs.readFileSync(path, 'utf8');
  const correctedContent = fileContent.replace(
    /(export type [\w\n ={]+templateType: )'(\w+)';/,
    "import { TemplateType } from './TemplateType';\n$1TemplateType.$2"
  );

  if (fileContent !== correctedContent) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path, correctedContent, { flag: 'w' });
  }
}
