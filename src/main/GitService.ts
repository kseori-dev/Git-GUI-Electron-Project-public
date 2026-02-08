/*
  GitService.ts – Git-Logik im Main-Prozess
 
  Dieses Modul kapselt sämtliche Git-Operationen der Anwendung und stellt
  eine abstrahierte Schnittstelle zur nativen Git-CLI bereit.
 
  Die Ausführung der Git-Kommandos erfolgt über `child_process.exec`
  im Kontext eines ausgewählten Repositories (`cwd`).
 
  Dieses Modul wird ausschließlich im Main-Prozess verwendet und ist
  nicht direkt aus dem Renderer zugänglich. Der Zugriff erfolgt indirekt
  über IPC-Handler.
 
  Der aktuelle Repository-Pfad wird intern verwaltet und vor jeder
  Operation validiert.
 */
import { exec } from 'child_process';

/*
  Aktuell ausgewählter Repository-Pfad.
  Wird über IPC vom Main-Prozess gesetzt.
 */
let repoPath: string | null = null;

/*
  Setzt den aktuellen Repository-Pfad.
 */
export function setRepoPath(path: string) {
  repoPath = path;
}

/*
  Alternative Setter-Funktion für den Repository-Pfad.
  (Kann perspektivisch konsolidiert werden.)
 */
export function setRepo(path: string) {
  repoPath = path;
}

/*
  Stellt sicher, dass ein Repository gesetzt ist,
  bevor Git-Befehle ausgeführt werden.
 */
function ensureRepo() {
  if (!repoPath) {
    throw new Error('Repository path is not set');
  }
  return repoPath;
}

/*
  Liefert die Commit-Historie aller Branches
  in vereinfachter Form (Hash + Message).
 */
export function getCommits(): Promise<{ hash: string; message: string }[]> {
  return new Promise((resolve, reject) => {
    exec(`git log --oneline --all`, { cwd: ensureRepo() }, (error, stdout) => {
      if (error) return reject(error);

      const commits = stdout
        .split('\n')
        .filter((line) => line)
        .map((line) => {
          const [hash, ...messageParts] = line.split(' ');
          return { hash, message: messageParts.join(' ') };
        });

      resolve(commits);
    });
  });
}

/*
  Erstellt einen neuen Branch und wechselt direkt zu diesem.
 */
export function createBranch(branchName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`git checkout -b ${branchName}`, { cwd: ensureRepo() }, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

/*
  Fügt alle Änderungen hinzu und erstellt einen Commit
  mit der angegebenen Commit-Message.
 */
export function commitAll(message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `git add . && git commit -m "${message}"`,
      { cwd: ensureRepo() },
      (error) => {
        if (error) return reject(error);
        resolve();
      },
    );
  });
}

/*
  Pusht den angegebenen Branch (standardmäßig "main")
  zum Remote-Repository.
 */
export function pushBranch(branchName = 'main'): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`git push origin ${branchName}`, { cwd: ensureRepo() }, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

/*
  Löscht einen lokalen Branch.
 */
export function deleteBranch(branchName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`git branch -d ${branchName}`, { cwd: ensureRepo() }, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

/*
  Liefert den aktuellen Git-Status im Kurzformat.
 */
export function getStatus(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`git status --short`, { cwd: ensureRepo() }, (error, stdout) => {
      if (error) return reject(error);
      resolve(stdout.trim());
    });
  });
}

/*
  Gibt eine Liste aller lokalen Branches zurück.
 */
export function getBranches(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec('git branch --list', { cwd: ensureRepo() }, (err, stdout) => {
      if (err) return reject(err);

      const branches = stdout
        .split('\n')
        .filter(Boolean)
        .map((b) => b.replace('*', '').trim());

      resolve(branches);
    });
  });
}

/*
  Liefert den Namen des aktuell ausgecheckten Branches.
 */
export function getCurrentBranch(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('git branch --show-current', { cwd: ensureRepo() }, (err, stdout) => {
      if (err) return reject(err);
      resolve(stdout.trim());
    });
  });
}

/*
  Wechselt zu einem angegebenen Branch.
 */
export function checkoutBranch(branch: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`git checkout ${branch}`, { cwd: ensureRepo() }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/*
  Merged einen Source-Branch in einen Target-Branch.
 */
export function mergeBranch(source: string, target: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `git checkout ${target} && git merge ${source}`,
      { cwd: ensureRepo() },
      (err) => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}