```bat
@echo off
REM AI-Powered Development Boilerplate Bootstrap Script (Windows)
REM 用途：为 Windows 用户一键初始化新项目骨架
REM
REM 使用：
REM   boilerplate-setup.bat my-app react
REM   boilerplate-setup.bat my-api node
REM
REM 参数：
REM   %1: 项目名称
REM   %2: 框架类型 (react^|vue^|svelte^|next^|node) - 默认: react

setlocal enabledelayedexpansion

if "%1"=="" (
    echo ❌ Usage: boilerplate-setup.bat ^<project-name^> [framework]
    echo.
    echo Frameworks: react, vue, svelte, next, node
    echo Example: boilerplate-setup.bat my-app react
    exit /b 1
)

set PROJECT_NAME=%1
set FRAMEWORK=%2
if "!FRAMEWORK!"=="" set FRAMEWORK=react

REM 直接调用 Node.js 脚本
node boilerplate-setup.mjs %PROJECT_NAME% --framework=%FRAMEWORK%

endlocal

```
