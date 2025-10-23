'use client';
import React, { useState } from 'react';
import { loadAsync } from 'jszip';

function normalizePath(p: string): string {
  // Remove any array-style indices like users[0].name -> users.name (we only care about field names)
  return (
    p
      // strip any embedded XML tags that may have been captured across DOCX text runs
      // eslint-disable-next-line sonarjs/slow-regex
      .replaceAll(/<[^>]+>/g, '')
      // remove array indices
      // eslint-disable-next-line sonarjs/slow-regex
      .replaceAll(/\[[^\]]*]/g, '')
      // collapse whitespace
      .replaceAll(/\s+/g, '')
      // collapse multiple dots
      .replaceAll(/\.+/g, '.')
      // trim leading/trailing dots
      .replace(/^\./, '')
      .replace(/\.$/, '')
  );
}

// eslint-disable-next-line sonarjs/cognitive-complexity
async function extractMarkersFromDocx(templateSource: File): Promise<string[]> {
  try {
    const ab = await templateSource.arrayBuffer();

    // eslint-disable-next-line sonarjs/no-unsafe-unzip
    const zip = await loadAsync(ab);

    const dataMarkers = new Set<string>();

    for (const [name, entry] of Object.entries(zip.files)) {
      if (!/\.xml$/i.test(name)) continue;

      const isWord = name.startsWith('word/');
      if (!isWord) continue;

      let xml = '';
      try {
        xml = await entry.async('string');
      } catch {
        continue;
      }

      const directRe = /{([^{]+?)}/g;
      let m: RegExpExecArray | null;

      while ((m = directRe.exec(xml)) !== null) {
        const rawPath = m[1];
        if (rawPath) {
          const path = normalizePath(rawPath);
          if (!path.startsWith('d.')) continue;

          dataMarkers.add(path.replace(/^d\./, ''));
        }
      }
    }

    const markers = [...dataMarkers].filter(Boolean).sort();
    return markers;
  } catch {
    return [];
  }
}

const DocxExtract: React.FC = () => {
  const [params, setParams] = useState<string[]>([]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const markers = await extractMarkersFromDocx(file);

    setParams(markers);
  };

  return (
    <>
      <input type='file' accept='.docx' onChange={handleFile} />
      <br />
      <ul>
        {params.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </>
  );
};

export default DocxExtract;
