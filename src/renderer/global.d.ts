/* 
Diese Datei enthält globale TypeScript-Typdefinitionen für das Renderer-Fenster.

Hier wird das `window.git`-API beschrieben, welches im `preload.ts` definiert
und dem Renderer-Prozess über den `contextBridge` sicher zur Verfügung gestellt wird.

Dadurch erhält die React-Anwendung:
- vollständige Typisierung
- Autocomplete-Unterstützung
- Compile-Time-Sicherheit beim Zugriff auf Git-Funktionen 
*/

export {};

declare global {
  interface Window {
    git: {
      getCommits: () => Promise<{ hash: string; message: string }[]>;
      createBranch: (name: string) => Promise<void>;
      commitAll: (message: string) => Promise<void>;
      pushBranch: () => Promise<void>;
      getBranches(): Promise<string[]>;
      getCurrentBranch(): Promise<string>;
      checkoutBranch(branch: string): Promise<void>;
      mergeBranch(
        source: string,
        target: string,
      ): Promise<void>;
      selectRepo: () => Promise<string>;
      setRepo: (path: string) => Promise<void>;
      getRepoPath: () => Promise<string>; 
    };
  }     
}
