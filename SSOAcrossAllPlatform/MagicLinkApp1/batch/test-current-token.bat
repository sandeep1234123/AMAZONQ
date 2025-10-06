@echo off
echo Testing current magic link token...
echo.

set TOKEN=eyJFbWFpbCI6InNhbmRlZXBrdW1hcjE0NjRAZ21haWwuY29tIiwiVGltZXN0YW1wIjoxNzU5NTEyNzIxLCJSYW5kb20iOiJLRjR3OVVDL2V5TlU4aTdCQ2dQQWhCVUJBdGs2R29nMHNcdTAwMkI3clhcdTAwMkJ0U3NRRT0ifQ==

echo Token: %TOKEN%
echo.

echo Testing debug endpoint...
curl -s "http://localhost:5200/Home/DebugToken?token=%TOKEN%" || echo Failed to connect to app

echo.
echo Testing direct magic link...
curl -s "http://localhost:5200/Home/VerifyMagicLink?token=%TOKEN%" || echo Failed to connect to app

echo.
echo Opening browser to test...
start "" "http://localhost:5200/Home/DebugToken?token=%TOKEN%"

pause