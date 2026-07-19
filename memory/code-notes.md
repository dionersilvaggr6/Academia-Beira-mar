# Code Notes — Beira Mar

## Ambiente
- Node.js v24.18.0 + npm 11.16.0 instalados via winget (2026-07-19). Binário em `C:\Program Files\nodejs\`.
- ⚠️ O PATH das sessões de terminal pode não incluir o Node até reiniciar o app. Se `node`/`npm` "não for reconhecido", recarregar o PATH na sessão:
  `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`
  ou usar o caminho completo `& "C:\Program Files\nodejs\npm.cmd" ...`.
