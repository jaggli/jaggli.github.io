# Security audit prompt generator

A two-stage prompt for auditing an open-source package with a frontier model before someone else finds the bugs.

1. **Scan.** [`prompt.md`](prompt.md) runs inside your repository. It reads the code (read-only), figures out what the package is, where it runs, who the realistic attackers are, and where untrusted data meets dangerous code. It then writes a repository-specific audit prompt to `security-audit/prompt.md`.
2. **Audit.** You run that generated prompt in a fresh session. It builds the project, hunts for vulnerabilities surface by surface, proves every Medium+ finding with a PoC, writes patches with regression tests, and produces a report.

The split exists because a good audit prompt has to name real files, payloads, and defaults. The scan session does that research, and the audit session starts with a clean context and a precise plan.

## Usage

### 1. Generate the audit prompt

From the root of the repository you want to audit:

```sh
claude "$(curl -fsSL https://raw.githubusercontent.com/jaggli/jaggli.github.io/master/security-audit/prompt.md)"
```

Use the most capable model and the highest reasoning effort available. When it finishes, it prints a short summary: the ranked attackers, the top surfaces, and open questions.

### 2. Review the generated prompt

Open `security-audit/prompt.md` and read it before you run it. Fix what the scan got wrong: things it could not know (production usage, which configurations matter to you), commands that look off, surfaces it ranked too high or too low. This is the cheapest point to steer the audit.

### 3. Run the audit

Start a **new** session in the same repository:

```sh
claude "$(cat security-audit/prompt.md)"
```

This takes a long time. Let it run. It works on a local `security-audit` branch and never pushes.

### 4. Read the results

Everything lands in `security-audit/`:

| File | Content |
| --- | --- |
| `REPORT.md` | Executive summary, findings with CVSS, fixes, advisory text, coverage matrix, rejected false positives |
| `ARCHITECTURE.md` | Data flow, published packages, where each runs, trust boundaries |
| `THREAT_MODEL.md` | Ranked attackers and scope |
| `FINDINGS_LOG.md` | Raw working notes and measurements behind the report |
| `poc/` | Runnable proofs of concept with recorded output |
| `patches/` | Fix diffs, each with a regression test |
| `logs/` | Build and test logs |

Start with the executive summary, then check each Confirmed finding by running its PoC yourself.

## Handling findings

The results describe unfixed vulnerabilities in a public package. Treat them as private.

- **Do not commit or push `security-audit/`.** The audit adds it to `.git/info/exclude`. Double-check before pushing anything from that branch.
- Report through a private channel, e.g. a [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/creating-a-repository-security-advisory) draft, and develop the fix in its private fork.
- Publish the advisory once a fixed version is released.

## Notes

- The model will be wrong sometimes. The prompt forces PoCs and a list of rejected false positives so you can check its reasoning, but you still own the verdict.
- Stage 2 runs builds, tests, dev servers, and browsers. Run it on a machine where that is acceptable, ideally a container or VM without your personal credentials.
- The audit prompt structure is modeled on a real audit of [next-yak](https://github.com/DigitecGalaxus/next-yak).
