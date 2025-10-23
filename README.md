# GTI_LTDA

Este repositorio contiene el frontend (React + Vite) y el backend (Node.js + Express) del proyecto.

## Requisitos previos
- Node.js 18 o superior
- npm 9 o superior

## Instalación de dependencias
Ejecuta este comando en la raíz del repositorio para instalar las dependencias del frontend y del backend:

```bash
npm install
```

## Ejecución en desarrollo
### Frontend
Desde la raíz del repositorio:

```bash
npm run dev
```

### Backend
Desde la carpeta `backend`:

```bash
cd backend
npm start
```

## Nota para Windows PowerShell
Si al ejecutar `npm run dev` aparece el error `No se puede cargar el archivo ... npm.ps1 porque la ejecución de scripts está deshabilitada en este sistema`, habilita la ejecución de scripts para tu usuario con el siguiente comando de PowerShell abierto como administrador:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Si prefieres aplicarlo solo a la sesión actual, puedes ejecutar:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Tras aplicar uno de los comandos anteriores, vuelve a ejecutar `npm run dev`
