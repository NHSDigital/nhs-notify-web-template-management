import carbone from 'carbone';
import { type Result, success, failure } from '../types/result';
import { extractMarkers } from './carbone-internal';

export class Carbone {
  render(path: string, personalisation: Record<string, string>) {
    return new Promise<Result<Buffer>>((resolve) => {
      carbone.render(
        path,
        personalisation,
        { convertTo: 'pdf' },
        (err, buf) => {
          if (err) {
            return resolve(failure(err));
          }
          if (!Buffer.isBuffer(buf)) {
            return resolve(
              failure(new Error('Rendered buffer is not a Buffer'))
            );
          }
          return resolve(success(buf));
        }
      );
    });
  }

  async extractMarkers(path: string): Promise<Result<Set<string>>> {
    try {
      const rawMarkers = await extractMarkers(path);

      const markers: string[] = [];

      for (const { name } of rawMarkers) {
        if (!name.startsWith('_root.')) {
          // warn
          continue;
        }

        markers.push(name.slice(6));
      }

      return success(new Set(markers));
    } catch (error) {
      return failure(error);
    }
  }
}
