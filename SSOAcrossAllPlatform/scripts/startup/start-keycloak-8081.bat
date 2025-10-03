@echo off
echo Starting Keycloak on port 8081...
cd keycloak-23.0.7
bin\kc.bat start-dev --http-port=8081
pause