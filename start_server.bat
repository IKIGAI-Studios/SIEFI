@REM Iniciar la consola minimizada y que no salgan los comandos
@echo on
@echo Iniciando servidor SIEFI ...
@REM Entrar a ruta del proyecto | Cambiar por la ruta del proyecto
cd C:\Users\gabri\OneDrive\Documents\GitHub\SIEFI
@REM Actualizar repositorio de git | Opcional
@REM git fetch origin
@REM Instalar todas las dependencias de node
@REM ! Se cierra despues de que se instalan las dependencias
@REM npm install
@REM Limpiar la consola
cls
@REM Ejecutar servidor modo silencioso desde pm2
@REM npm run start_server_hidden
pm2 start index.js