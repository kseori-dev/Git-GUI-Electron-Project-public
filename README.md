# My Git Client (Electron + TypeScript)

## Projektübersicht

Dieses Projekt ist ein Desktop-Git-Client, der mit Electron und TypeScript entwickelt wurde.  
Das Ziel des Projekts ist es, grundlegende Git-Funktionalitäten über eine grafische Benutzeroberfläche (GUI) zugänglich zu machen, ohne ausschließlich mit der Kommandozeile arbeiten zu müssen.

Die Anwendung richtet sich insbesondere an Entwickler:innen, die:
- Git täglich nutzen,
- eine visuelle Übersicht über Commits und Branches bevorzugen,
- einfache Git-Operationen schnell und verständlich ausführen möchten.

Dieses Projekt befindet sich in einer frühen Entwicklungsphase (MVP) und stellt keine finale Version dar, sondern bildet die technische und konzeptionelle Grundlage für eine weiterführende Entwicklung.



## Motivation und Zielsetzung

Git ist ein unverzichtbares Werkzeug in der modernen Softwareentwicklung, stellt jedoch insbesondere für Einsteiger:innen eine gewisse Einstiegshürde dar.  
Dieses Projekt verfolgt das Ziel:

- Git-Prozesse transparenter zu machen  
- typische Git-Operationen visuell darzustellen 

Der Fokus liegt dabei auf Verständlichkeit, Erweiterbarkeit und sauberer Architektur.



## Funktionsumfang (aktueller Stand)

Der aktuelle MVP unterstützt folgende Funktionen:
- Wahl der Repository
- Anzeige der aktuelle Repositiry
- Erstellen neuer Branches 
- Anzeige des aktueller Branch
- Checkout des Branch 
- Anzeige der Commit-Historie eines lokalen Repositories  
- Commit aller Änderungen mit Commit-Nachricht  
- Push auf ein Remote-Repository  
- Aktualisierung der Commit-Liste über die GUI  

Die Git-Interaktion erfolgt bewusst über das native Git-CLI mittels Node.js, um maximale Stabilität und Plattformunabhängigkeit zu gewährleisten.
Wie z.B.:

      import { exec } from "child_process";

      exec("git status", (error, stdout) => {
        console.log(stdout);
      });



## Projektstruktur und Architektur

Die Anwendung folgt einer klaren Trennung der Verantwortlichkeiten:

my-git-client/
    main.ts # Hauptprozess von Electron
    preload.ts # Sichere Brücke zwischen Main- und Renderer-Prozess
    GitService.ts # Git-Logik (child_process)
    renderer/
        App.tsx # React-basierte Benutzeroberfläche
        index.tsx # Einstiegspunkt der UI
        global.d.ts 
    package.json
    tsconfig.json



### Architektur-Erklärung

- Electron Main Process  
  Verantwortlich für das Erstellen des Fensters und die Applikationssteuerung.

- Renderer Process (React + TypeScript)  
  Stellt die grafische Benutzeroberfläche bereit und reagiert auf Benutzerinteraktionen.

- GitService  
  Kapselt sämtliche Git-Befehle und stellt eine klare API für die UI zur Verfügung.  
  Die Kommunikation mit Git erfolgt über `child_process`, wodurch Git-Befehle identisch zur Kommandozeile ausgeführt werden.

Diese Struktur ermöglicht:
- gute Testbarkeit,
- einfache Erweiterung (z.B. GitHub/GitLab-Integration),
- saubere Trennung von UI und Business-Logik.



## Zielgruppe

Dieses Projekt kann besonders nützlich sein für:

- Junior-Entwickler:innen und Studierende  
- Entwickler:innen, die Git visuell verstehen möchten   
- Entwickler:innen, die an der Erweiterung eines Open-Source-Git-Clients interessiert sind  



## Projektstatus und Ausblick

Wichtiger Hinweis:  
Dieses Projekt stellt keine fertige Anwendung dar. Es handelt sich um eine erste funktionsfähige Version, die als Basis für zukünftige Erweiterungen dient.

Geplante Erweiterungen könnten unter anderem sein:

- grafische Darstellung von Branches und Merges  
- Unterstützung mehrerer Repositories  
- Konfliktanzeige und -behandlung
- Verbesserte Fehlerbehandlung und Logging  



## Fazit

Dieses Projekt zeigt, wie sich Git-Funktionalität sinnvoll in eine Desktop-Anwendung integrieren lässt.  
Der Fokus liegt weniger auf Feature-Vollständigkeit, sondern auf sauberer Architektur, Verständlichkeit und Erweiterbarkeit.

Es dient sowohl als Lernprojekt als auch als Grundlage für einen vollwertigen Git-Client.



## Hinweis

Dieses Projekt basiert initial auf dem Electron React Boilerplate:
https://github.com/electron-react-boilerplate/electron-react-boilerplate

Das Boilerplate wurde jedoch stark angepasst und dient nur als technische Grundlage.