# Auto Commit Script

Script per automatizzare i commit Git da terminale con comandi semplici. Disponibile globalmente dopo l’installazione.

## Setup su un nuovo PC

1. **Clona il repo** (se non ce l’hai già):
   ```bash
   git clone <url-del-repo> auto-commit-script
   cd auto-commit-script
   ```

2. **Installa le dipendenze e abilita il comando globalmente**:
   ```bash
   npm install
   npm link
   ```

3. **Configura Git** (credenziali/SSH) per push su GitHub/GitLab, se non l’hai già fatto sul nuovo PC.

Dopo il `npm link` (o `npm install -g .`), il comando **`commit`** sarà disponibile in qualsiasi cartella.

Se vedi l’errore `EEXIST` su `commit`, rimuovi l’eseguibile esistente e reinstalla:
```bash
rm -f /opt/homebrew/bin/commit   # oppure il path indicato da npm
npm install -g .
```

### Installazione globale da qualsiasi percorso

```bash
npm install -g /percorso/auto-commit-script
```

Oppure dalla cartella del progetto: `npm install -g .` oppure `npm link`.

## Comportamento

Lo script esegue sempre: **add .** (tutti i file), **commit** con messaggio `{prefisso}: {messaggio}`, e (salvo `--no-push`) **push** su `origin` sul branch corrente. Per `first`: init, add, commit, rinomina branch (default `main`), aggiunge remote `origin`, push.

## Utilizzo

Esegui da dentro una repository Git. Tipi con emoji:

| Tipo | Emoji | Comando | Descrizione |
|------|-------|--------|-------------|
| fix | 🛠 | `commit fix "descrizione"` | Fix / correzioni |
| feat | ✅ | `commit feat "descrizione"` | Nuova feature |
| refactoring | ♻️ | `commit refactoring "descrizione"` | Refactoring |
| first | 🚀 | `commit first "url-remote"` | Primo commit: init, add, commit, branch main, remote, push |
| (nessuno) | 🤖 | `commit` | Commit automatico con messaggio di default |

Opzioni: **`-h` / `--help`** (mostra aiuto), **`-n` / `--no-push`** (solo add + commit, senza push), **`--branch nome`** (per `first`: usa questo branch invece di `main`).

Esempi:

```bash
commit
commit fix "corretto bug nel login"
commit feat "aggiunto pulsante export" --no-push
commit refactoring "semplificata logica API"
commit first "https://github.com/user/repo.git"
commit first "https://github.com/user/repo.git" --branch develop
commit --help
```

## Requisiti

- Node.js (>= 18)
- Git installato e in PATH
- **Icone:** lo script usa le stesse icone di [Powerlevel10k](https://github.com/romkatv/powerlevel10k). Per vederle correttamente usa un [Nerd Font](https://www.nerdfonts.com/) (es. MesloLGS NF, FiraCode Nerd Font) nel terminale.

## Troubleshooting

**`zsh: command not found: commit`**  
Il comando non è in PATH in questa sessione. Prova:

1. Ricarica la shell: `source ~/.zshrc` e riprova.
2. Apri un nuovo tab/finestra del terminale.
3. Se usi nvm: `nvm use default` (o la versione con cui hai fatto `npm link`).
4. Verifica che il comando esista: `which commit` (deve mostrare un path tipo `…/node/…/bin/commit`).

Se ancora non funziona, dalla cartella del progetto esegui di nuovo `npm link`.

**"Niente da committare, working tree pulido"**  
Non ci sono modifiche da includere nel commit. Lo script fa già add di tutti i file; se il messaggio appare comunque, la working tree è già pulita (nessun file modificato o non tracciato). Aggiungi o modifica file e riprova.

**Push rifiutato / non-fast-forward**  
Il remote ha commit che non hai in locale. Esegui `git pull --rebase origin <branch>` (o `git pull`) e poi ripeti il push o usa di nuovo `commit`.

## Licenza

ISC
