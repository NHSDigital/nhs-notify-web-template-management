import carbone from 'carbone';
import { extractMarkers } from './carbone-internal';

export class Carbone {
  constructor() {
    carbone.set({ factories: 1 });
  }

  render(
    path: string,
    personalisation: Record<string, string>
  ): Promise<Buffer> {
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

  async extractMarkers(path: string): Promise<Set<string>> {
    const rawMarkers = await extractMarkers(path);

    const markers = rawMarkers.map((name) => {
      if (!name.startsWith('_root.')) {
        throw new Error(`Unexpected marker name ${name}`);
      }
      return name;
    });

    return new Set(markers);
  }
}
