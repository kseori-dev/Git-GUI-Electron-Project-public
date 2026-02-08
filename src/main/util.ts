/*
  Dieses Utility-Modul bestimmt, von wo aus die HTML-Datei der Renderer-UI
  geladen werden soll.
 
  Im Entwicklungsmodus (development) wird die HTML-Datei über einen lokalen
  Dev-Server (z.B. React/Vite/Webpack) unter http://localhost geladen,
  um Hot Reloading und schnelles Entwickeln zu ermöglichen.
 
  Im Produktionsmodus (production) wird die HTML-Datei direkt aus dem
  gebauten Dateisystem (file://) geladen, da kein Dev-Server mehr existiert.
 
  Die Funktion kapselt die Unterscheidung zwischen Development- und
  Production-Umgebung, sodass der Main-Prozess diese Logik nicht selbst
  implementieren muss.
 */

/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}
