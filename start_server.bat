@REM TODO: Investigar como hacer un fecht a git y luego ejecutar el servidor
@REM Entrar a ruta del proyecto
cd C:\Users\erick\Documents\Github\testSiefi\SIEFI\
@REM Actualizar repositorio de git
git fetch origin
@REM Instalar todas las dependencias de node
@REM ! Se cierra despues de que se instalan las dependencias
@REM npm install
@REM Abrir navegador con la pagina de inicio
start "SIEFI" "http://localhost:3000"
@REM Ejecutar servidor modo silencioso
nodemon --quiet index
