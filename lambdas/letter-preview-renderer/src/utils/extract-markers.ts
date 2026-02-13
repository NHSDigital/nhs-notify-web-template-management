import file from 'carbone/lib/file';
import parser from 'carbone/lib/parser';
import type { Template } from 'carbone/lib/file';
import type { Marker } from 'carbone/lib/parser';

function openTemplateAsync(templatePath: string): Promise<Template> {
  return new Promise((resolve, reject) => {
    file.openTemplate(templatePath, (err, template) => {
      if (err) {
        reject(err);
      } else {
        resolve(template);
      }
    });
  });
}

function findMarkersAsync(xml: string): Promise<Marker[]> {
  return new Promise((resolve, reject) => {
    parser.findMarkers(xml, (err, _cleanedXml, markers) => {
      if (err) {
        reject(err);
      } else {
        resolve(markers);
      }
    });
  });
}

const DATA_REGEX = /^_root\.d\.(.+)$/;

export async function extractDataFields(
  templatePath: string
): Promise<string[]> {
  const template = await openTemplateAsync(templatePath);
  const dataFields = new Set<string>();

  for (const templateFile of template.files) {
    if (!templateFile.isMarked || typeof templateFile.data !== 'string') {
      continue;
    }

    const cleanedXml = parser.removeXMLInsideMarkers(templateFile.data);
    const markers = await findMarkersAsync(cleanedXml);

    for (const marker of markers) {
      const [, match] = marker.name.match(DATA_REGEX) ?? [];

      if (match) {
        dataFields.add(match);
      }
    }
  }

  return [...dataFields].sort();
}
