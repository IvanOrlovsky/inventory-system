@echo off
echo Creating backend...

:: Переходим в папку BACKEND
cd BACKEND

:: Создание виртуального окружения
python -m venv venv

:: Активируем виртуальное окружение
call venv\Scripts\activate

:: Установка зависимостей из requirements.txt
pip install -r requirements.txt

:: Запуск бекенда
echo Starting backend...
start python run.py

:: Возвращаемся в корневую папку проекта
cd ..

:: Установка pnpm (если ещё не установлен)
npm install -g pnpm

:: Установка зависимостей для фронтенда
pnpm install

:: Запуск фронтенда в новом окне
echo Starting frontend...
cmd /c "pnpm start"

:: Завершаем выполнение
pause
