@echo off
echo CV Hazirlayici Baslatiliyor...
echo Lutfen bu pencereyi kapatmayin.
cd backend
if not exist node_modules (
    echo Gerekli kutuphaneler yukleniyor...
    npm install
)
start http://localhost:3000
node server.js
pause
