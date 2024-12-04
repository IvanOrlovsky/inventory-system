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
python run.py
