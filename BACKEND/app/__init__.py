from datetime import date
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite')

# Инициализация объекта SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    
    # Инициализация приложения с базой данных
    db.init_app(app)
    
    from .models import Client, Material, Supplier, Supply, SupplyStatus, WarehouseSection, Balance, Request, OrderStatus, MaterialsInSupply

    # Создаём таблицы в базе данных, если их нет
    with app.app_context():
        # Создаём таблицы, если они ещё не существуют
        db.create_all()

        # Заполняем тестовые данные
        if not Client.query.first():  # Проверяем, пустая ли база
            client1 = Client(name="Петя")
            client2 = Client(name="Вова")
            db.session.add_all([client1, client2])

            material1 = Material(name="Ручки")
            material2 = Material(name="Карандаши")
            material3 = Material(name="Скобки для степлера")
            db.session.add_all([material1, material2, material3])

            supplier1 = Supplier(name="Поставщик из России")
            supplier2 = Supplier(name="Поставщик из-за рубежа")
            db.session.add_all([supplier1, supplier2])

            section1 = WarehouseSection(name="Северная секция склада")
            section2 = WarehouseSection(name="Южная секция склада")
            db.session.add_all([section1, section2])


            db.session.commit()

            print("Sample data added to the database.")
        
        
    
    with app.app_context():
        from . import routes
    
    return app
