# Kinó Café Manager

Gestionale del Kinó Café: sito pubblico, area soci, cassa, stampa scontrini e display LCD.

> [!NOTE]
> Il Kinó Café ha chiuso (dicembre 2024 – giugno 2025). Il sito è ancora online su [cafe.kinocampus.it](https://cafe.kinocampus.it/).
>
> Kinó Café has closed (December 2024 – June 2025). The website is still live at [cafe.kinocampus.it](https://cafe.kinocampus.it/).

| Cartella           | Cosa                                   | Stack                      |
| ------------------ | -------------------------------------- | -------------------------- |
| `apps/backend`     | API REST (`/v1`) + server socket.io     | NestJS, Prisma, Postgres   |
| `apps/web`         | Frontend + server Express di produzione | Vite, React, HeroUI        |
| `hardware/printer` | Client della stampante scontrini        | Python, python-escpos      |
| `hardware/esp32`   | Display LCD della cassa                 | Arduino (ESP32)            |

## Come si collegano

- **web ⇄ backend**: REST su `/v1` (in dev tramite il proxy di Vite verso `localhost:5000`).
- **backend ⇄ printer**: socket.io, il backend invia gli scontrini da stampare.
- **web ⇄ esp32**: Web Serial API dalla pagina `/cashier`.

## Quick start

Prerequisiti: Node.js 24+, pnpm, Python 3 (solo per la stampante).

```bash
pnpm install
# crea apps/backend/.env e apps/web/.env (vedi i README delle app)
pnpm --filter backend exec prisma migrate deploy
pnpm dev       # backend + web in parallelo (Turborepo)
```

Altri comandi: `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm format`.

## Deploy

```bash
./deploy.sh            # tutto
./deploy.sh backend    # solo backend
./deploy.sh web        # solo frontend
```

I processi PM2 `Kino Manager BE` e `Kino Manager FE` devono avere come `cwd` rispettivamente `apps/backend` e `apps/web`.
