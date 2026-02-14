import carbone from 'carbone';
import { extractMarkers } from './carbone-internal';

export class Carbone {
  render(path: string, personalisation: Record<string, string>) {
    return new Promise<Buffer>((resolve, reject) => {
      carbone.render(
        path,
        personalisation,
        { convertTo: 'pdf' },
        (err, buf) => {
          if (err) {
            return reject(err);
          }
          if (!Buffer.isBuffer(buf)) {
            return reject(new Error('Rendered buffer is not a Buffer'));
          }
          return resolve(buf);
        }
      );
    });
  }

  async extractMarkers(path: string) {
    const rawMarkers = await extractMarkers(path);
    const unique = new Set(rawMarkers);

    const markers: string[] = [];

    for (const { name } of unique) {
      if (!name.startsWith('_root.')) {
        // warn
        continue;
      }

      markers.push(name.slice(6));
    }

    return markers.sort();
  }
}
