// carbone internals
// any usage of these should be unit tested thoroughly because there is no promise of API stability
import file from 'carbone/lib/file';
import parser from 'carbone/lib/parser';
import type { Template } from 'carbone/lib/file';
import type { Marker } from 'carbone/lib/parser';

function openTemplateAsync(templatePath: string): Promise<Template> {
  return new Promise((resolve, reject) => {
    file.openTemplate(templatePath, (err, template) => {
      if (err) reject(err);
      else resolve(template);
    });
  });
}

function findMarkersAsync(xml: string): Promise<Marker[]> {
  return new Promise((resolve, reject) => {
    parser.findMarkers(xml, (err, _, markers) => {
      if (err) reject(err);
      else resolve(markers);
    });
  });
}

export async function extractMarkers(path: string): Promise<string[]> {
  const { files } = await openTemplateAsync(path);

  const markerArrays = await Promise.all(
    files.map(({ isMarked, data }) =>
      isMarked && typeof data === 'string'
        ? findMarkersAsync(parser.removeXMLInsideMarkers(data))
        : []
    )
  );

  return markerArrays.flat().map(({ name }) => name);
}
