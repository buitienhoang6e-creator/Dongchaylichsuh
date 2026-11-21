@echo off
rem Nhap dup file nay de dua web len mang (xem huong dan trong chay-web-cong-khai.ps1)
title Dong chay lich su - web cong khai
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0chay-web-cong-khai.ps1"
