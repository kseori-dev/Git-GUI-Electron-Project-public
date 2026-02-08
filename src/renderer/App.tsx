import { useEffect, useState } from 'react';

type Commit = {
  hash: string;
  message: string;
};

function App() {
  const [repoPath, setRepoPath] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState(''); //for displaying current branch
  const [branches, setBranches] = useState<string[]>([]); //for branch dropdowns
  const [branchName, setBranchName] = useState(''); //for creating new branch
  const [selectedBranch, setSelectedBranch] = useState(''); //for checkout dropdown
  const [sourceBranch, setSourceBranch] = useState(''); //for merge source
  const [targetBranch, setTargetBranch] = useState(''); //for merge target
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitMessage, setCommitMessage] = useState('');

  useEffect(() => {
    if (!repoPath) return;

    const loadRepoData = async () => {
      const allBranches = await window.git.getBranches();
      const current = await window.git.getCurrentBranch();
      const allCommits = await window.git.getCommits();

      setBranches(allBranches);
      setCurrentBranch(current);
      setSelectedBranch(current || allBranches[0] || '');
      setCommits(allCommits);
    };

    loadRepoData().catch(console.error);
  }, [repoPath]);

  const handleSelectRepo = async () => {
    const path = await window.git.selectRepo();
    if (path) {
      await window.git.setRepo(path); /* // tell the main about the new repo path */
    setRepoPath(path);              // update the UI with the new repo path
    }
  };

  const loadCommits = async () => {
    try {
      const data = await window.git.getCommits();
      setCommits(data);
    } catch (error) {
      console.log('Failed to load commits:', error);
    }
  };

  const handleCommitAll = async () => {
    const result = await window.git.commitAll(commitMessage);

    if (!result?.ok) {
      //якщо result не undefined / не null → візьми ok
      //якщо result undefined → поверни undefined, без помилки
      alert(result?.error ?? 'Commit failed');
      //якщо result?.error не null і не undefined → використовуй його
      //інакше → 'Commit failed'
      return;
    }

    alert('Commit created!');
    setCommitMessage('');
    loadCommits();
  };

  const handlePush = async () => {
    try {
      await window.git.pushBranch();
      console.log('Pushed to GitHub successfully!', branchName);
      alert('Pushed to GitHub successfully!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleMerge = async () => {
    if (sourceBranch === targetBranch) {
      alert('Cannot merge branch into itself');
      return;
    }
    if (!sourceBranch || !targetBranch) {
      alert('Select both branches');
      return;
    }

    if (sourceBranch === targetBranch) {
      alert('Source and target must be different');
      return;
    }

    try {
      await window.git.mergeBranch(sourceBranch, targetBranch);
      alert(`Merged ${sourceBranch} → ${targetBranch}`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCheckout = async () => {
    if (!selectedBranch) {
      alert('No branch selected');
      return;
    }

    if (selectedBranch === currentBranch) {
      alert('Already on this branch');
      return;
    }

    try {
      await window.git.checkoutBranch(selectedBranch);

      const realBranch = await window.git.getCurrentBranch();
      setCurrentBranch(realBranch);
      setSelectedBranch(realBranch);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Git GUI</h1>
      {!repoPath && <p>Please select a repository</p>}

      <button onClick={handleSelectRepo}>Open repository</button>

      {repoPath && (
        <>
          <p>Repo: {repoPath}</p>

          <p>
            <strong>Current branch:</strong> {currentBranch}
          </p>
        </>
      )}

      <h2>Checkout branch</h2>

      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        disabled={branches.length === 0}
      >
        <option value="" disabled>
          Select branch
        </option>

        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={
          !selectedBranch ||
          branches.length === 0 ||
          selectedBranch === currentBranch
        }
      >
        Checkout
      </button>

      <h2>Commits</h2>
      <ul>
        {commits.map((commit) => (
          <li key={commit.hash}>
            <b>{commit.hash.slice(0, 7)}</b> — {commit.message}
          </li>
        ))}
      </ul>

      <h2>Create branch</h2>
      <input
        value={branchName}
        onChange={(e) => setBranchName(e.target.value)}
        placeholder="branch name"
      />
      <button type="button" onClick={() => window.git.createBranch(branchName)}>
        Create
      </button>

      <h2>Commit</h2>
      <input
        value={commitMessage}
        onChange={(e) => setCommitMessage(e.target.value)}
        placeholder="commit message"
      />
      <button type="button" onClick={handleCommitAll}>
        Commit all
      </button>

      <h2>Push</h2>
      <button type="button" onClick={handlePush}>
        Push to GitHub
      </button>

      <h2>Merge branches</h2>
      <select
        value={sourceBranch}
        onChange={(e) => setSourceBranch(e.target.value)}
      >
        <option value="">Select source branch</option>
        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <select
        value={targetBranch}
        onChange={(e) => setTargetBranch(e.target.value)}
      >
        <option value="">Select target branch</option>
        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <button type="button" onClick={handleMerge}>
        Merge
      </button>
    </div>
  );
}

export default App;
