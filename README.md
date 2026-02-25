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

## Utilizzo

Esegui da dentro una repository Git:

| Comando | Descrizione |
|--------|-------------|
| `commit` | Commit automatico con messaggio di default |
| `commit fix "descrizione"` | Commit di tipo fix |
| `commit feat "descrizione"` | Commit per nuova feature |
| `commit refactoring "descrizione"` | Commit di refactoring |
| `commit first "url-remote"` | Primo commit: init, add, commit, branch main, remote, push |

Esempi:

```bash
commit
commit fix "corretto bug nel login"
commit feat "aggiunto pulsante export"
commit refactoring "semplificata logica API"
commit first "https://github.com/user/repo.git"
```

## Requisiti

- Node.js
- Git installato e in PATH

## Troubleshooting

**`zsh: command not found: commit`**  
Il comando non è in PATH in questa sessione. Prova:

1. Ricarica la shell: `source ~/.zshrc` e riprova.
2. Apri un nuovo tab/finestra del terminale.
3. Se usi nvm: `nvm use default` (o la versione con cui hai fatto `npm link`).
4. Verifica che il comando esista: `which commit` (deve mostrare un path tipo `…/node/…/bin/commit`).

Se ancora non funziona, dalla cartella del progetto esegui di nuovo `npm link`.

## Licenza

ISC
