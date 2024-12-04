from datetime import datetime
from flask import request, jsonify
from . import db
from .models import *
from flask import current_app as app

# Получить все записи из сущности
@app.route('/api/<entity>', methods=['GET'])
def get_all_entities(entity):
    try:
        if entity == "clients":
            data = Client.query.all()
        elif entity == "materials":
            data = Material.query.all()
        elif entity == "requests":
            data = Request.query.all()
        elif entity == "suppliers":
            data = Supplier.query.all()
        elif entity == "supplies":
            data = Supply.query.all()
        elif entity == "warehouse_sections":
            data = WarehouseSection.query.all()
        elif entity == "balances":
            data = Balance.query.all()
        else:
            return jsonify({"error": "Invalid entity type"}), 400

        return jsonify([item.to_dict() for item in data]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Получить информацию о конкретной сущности 
@app.route('/api/<entity>/<int:id>', methods=['GET'])
def get_entity_by_id(entity, id):
    try:
        if entity == "clients":
            data = Client.query.get(id)
        elif entity == "materials":
            data = Material.query.get(id)
        elif entity == "requests":
            data = Request.query.get(id)
        elif entity == "suppliers":
            data = Supplier.query.get(id)
        elif entity == "supplies":
            data = Supply.query.get(id)
        elif entity == "warehouse_sections":
            data = WarehouseSection.query.get(id)
        elif entity == "balances":
            # Balance uses composite keys; modify as needed to fetch it based on keys
            return jsonify({"error": "Cannot fetch balance by single ID"}), 400
        else:
            return jsonify({"error": "Invalid entity type"}), 400

        if not data:
            return jsonify({"error": f"{entity[:-1].capitalize()} not found"}), 404

        return jsonify(data.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask import request, jsonify
from datetime import datetime
from .models import db, Supplier, Supply, Material, MaterialsInSupply, SupplyStatus

@app.route('/api/supplies', methods=['POST'])
def create_supply():
    try:
        # Parse JSON from the request
        data = request.get_json()

        # Validate required fields
        if not data:
            return jsonify({"error": "Invalid input"}), 400

        required_fields = ['supplier_id', 'materials']  # 'materials' will be a list of dicts
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Check if supplier exists
        supplier = Supplier.query.get(data['supplier_id'])
        if not supplier:
            return jsonify({"error": "Supplier not found"}), 404

        # Create a new supply with the current date
        new_supply = Supply(
            date_of_creation=datetime.now().date(),
            status=SupplyStatus.WAITING,
            supplier_id=data['supplier_id']
        )

        db.session.add(new_supply)
        db.session.commit()

        # Add materials with quantities to MaterialsInSupply
        for material_data in data['materials']:
            material_id = material_data.get('id')
            quantity = material_data.get('quantity')

            if not material_id or not quantity or quantity <= 0:
                return jsonify({"error": "Invalid material data"}), 400

            # Check if material exists
            material = Material.query.get(material_id)
            if not material:
                return jsonify({"error": f"Material with ID {material_id} not found"}), 404

            # Create MaterialsInSupply entry
            materials_in_supply = MaterialsInSupply(
                material_id=material_id,
                supply_id=new_supply.id,
                quantity=quantity
            )
            db.session.add(materials_in_supply)

        db.session.commit()

        return jsonify(new_supply.to_dict()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Принять поставку
@app.route('/api/supplies/<int:supply_id>/accept', methods=['PATCH'])
def accept_supply(supply_id):
    try:
        # Найти поставку по ID
        supply = Supply.query.get(supply_id)
        if not supply:
            return jsonify({"error": "Supply not found"}), 404

        if supply.status == SupplyStatus.ACCEPTED:
            return jsonify({"message": "Supply is already accepted"}), 400

        # Логика проверки и обновления материалов в секциях склада
        for materials_in_supply in supply.supply_materials_in_supply:
            material_id = materials_in_supply.material_id
            supply_quantity = materials_in_supply.quantity

            # Проверить наличие материала в секциях склада
            balance_entry = Balance.query.filter_by(material_id=material_id).first()

            if balance_entry:
                # Если материал найден, обновляем количество
                balance_entry.quantity += supply_quantity
            else:
                # Если материал не найден, ничего не делаем
                pass

        # Обновить статус поставки на ACCEPTED
        supply.status = SupplyStatus.ACCEPTED
        db.session.commit()

        return jsonify({"message": "Supply accepted", "supply": supply.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Разместить материал на складе
@app.route('/api/balances', methods=['POST'])
def place_material_in_warehouse():
    try:
        data = request.get_json()
        material_id = data.get('material_id')
        warehouse_section_id = data.get('warehouse_section_id')
        quantity = data.get('quantity')

        if not material_id or not warehouse_section_id or not quantity:
            return jsonify({"error": "Material ID, Warehouse Section ID and Quantity are required"}), 400

        material = Material.query.get(material_id)
        warehouse_section = WarehouseSection.query.get(warehouse_section_id)

        if not material:
            return jsonify({"error": f"Material with ID {material_id} not found"}), 404
        if not warehouse_section:
            return jsonify({"error": f"Warehouse section with ID {warehouse_section_id} not found"}), 404
        
        existing_balance = Balance.query.filter_by(
            material_id=material_id,
            warehouse_section_id=warehouse_section_id
        ).first()
        if existing_balance:
            return jsonify({"error": "Material is already placed in the specified warehouse section"}), 400


        new_balance = Balance(
            material_id=material_id,
            warehouse_section_id=warehouse_section_id,
            quantity=quantity
        )
        db.session.add(new_balance)
        db.session.commit()

        return jsonify({
            "message": "Material successfully placed in the warehouse",
            "balance": new_balance.to_dict()
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Создание запроса
@app.route('/api/requests', methods=['POST'])
def create_request():
    try:
        data = request.get_json()
        client_id = data.get('client_id')
        material_id = data.get('material_id')
        date_of_creation = data.get('date_of_creation') 

        if not client_id or not material_id or not date_of_creation:
            return jsonify({"error": "Client ID, Material ID, and Date of Creation are required"}), 400

        client = Client.query.get(client_id)
        material = Material.query.get(material_id)

        if not client:
            return jsonify({"error": f"Client with ID {client_id} not found"}), 404
        if not material:
            return jsonify({"error": f"Material with ID {material_id} not found"}), 404

        new_request = Request(
            client_id=client_id,
            material_id=material_id,
            date_of_creation=date_of_creation
        )
        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            "message": "Request successfully created",
            "request": new_request.to_dict()
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Принять запрос
@app.route('/api/requests/<int:request_id>/accept', methods=['PUT'])
def accept_request(request_id):
    try:
        request_obj = Request.query.get(request_id)
        if not request_obj:
            return jsonify({"error": f"Request with ID {request_id} not found"}), 404

        if request_obj.status != OrderStatus.INWORK:
            return jsonify({"error": "Request cannot be accepted as it is not 'INWORK'"}), 400

        balance_entry = Balance.query.filter_by(material_id=request_obj.material_id).first()
        if not balance_entry:
            return jsonify({"error": "Material is not available in any warehouse section"}), 400

        db.session.delete(balance_entry)

        request_obj.status = OrderStatus.GIVEN

        db.session.commit()

        return jsonify({
            "message": "Request successfully accepted",
            "request": request_obj.to_dict()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Получить все материалы для размещения
@app.route('/api/materials/available-for-placing', methods=['GET'])
def get_materials_available_for_placing():
    try:
        # Получить все принятые поставки
        supplies = Supply.query.filter_by(status=SupplyStatus.ACCEPTED).all()
        if not supplies:
            return jsonify({"error": "No supplies with 'ACCEPTED' status found"}), 404

        # Словарь {material_id: quantity} из принятых поставок
        materials_quantity_map = {}
        for supply in supplies:
            for materials_in_supply in supply.supply_materials_in_supply:
                material_id = materials_in_supply.material_id
                materials_quantity_map[material_id] = (
                    materials_quantity_map.get(material_id, 0) + materials_in_supply.quantity
                )

        # Получить ID материалов, которые уже есть в секциях склада
        placed_material_ids = {
            row[0] for row in db.session.query(Balance.material_id).distinct().all()
        }

        # Исключить материалы, которые уже размещены
        available_materials_map = {
            material_id: quantity
            for material_id, quantity in materials_quantity_map.items()
            if material_id not in placed_material_ids
        }

        # Получить объекты доступных материалов
        available_materials = Material.query.filter(Material.id.in_(available_materials_map.keys())).all()

        # Формирование ответа
        result = [
            {
                "id": material.id,
                "name": material.name,
                "quantity": available_materials_map[material.id],
            }
            for material in available_materials
        ]

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500





# Отменить запрос
@app.route('/api/requests/<int:request_id>/cancel', methods=['PUT'])
def cancel_request(request_id):
    try:
        # Fetch the request by ID
        request_obj = Request.query.get(request_id)

        # If the request does not exist, return an error
        if not request_obj:
            return jsonify({"error": f"Request with ID {request_id} not found"}), 404

        # Change the status of the request to "CANCELED"
        request_obj.status = OrderStatus.CANCELED

        # Save the changes
        db.session.commit()

        return jsonify({"message": f"Request with ID {request_id} has been canceled"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Получить все материалы, доступные для выдачи
@app.route('/api/materials-available', methods=['GET'])
def get_available_materials():
    try:
        # Query materials that are in balance
        available_materials = db.session.query(Material).join(Balance).all()
        
        # Convert to dictionary format for easier JSON serialization
        materials = [material.to_dict() for material in available_materials]
        
        return jsonify(materials), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Получить все материалы в балансе с секциями склада
@app.route('/api/warehouse/sections/materials', methods=['GET'])
def get_materials_in_sections():
    try:
        # Запрос для получения всех материалов в балансе с секциями склада и количеством каждого материала
        materials_in_sections = db.session.query(
            WarehouseSection.id.label('section_id'),
            WarehouseSection.name.label('section_name'),
            Material.id.label('material_id'),
            Material.name.label('material_name'),
            db.func.sum(Balance.quantity).label('total_quantity')  # Суммируем количество материалов
        ).join(Balance, WarehouseSection.id == Balance.warehouse_section_id) \
         .join(Material, Balance.material_id == Material.id) \
         .group_by(WarehouseSection.id, Material.id).all()

        # Группируем материалы по секциям
        result = {}
        for row in materials_in_sections:
            section_id = row.section_id
            section_name = row.section_name
            material_data = {
                "id": row.material_id,
                "name": row.material_name,
                "quantity": row.total_quantity  # Добавляем количество материала в секции
            }

            if section_id not in result:
                result[section_id] = {
                    "section_name": section_name,
                    "materials": []
                }
            result[section_id]["materials"].append(material_data)

        # Преобразуем результат в список
        result_list = [
            {"section_id": section_id, **data} for section_id, data in result.items()
        ]

        return jsonify(result_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Удалить материал из ячейки склада
@app.route('/api/balance/<int:section_id>/<int:material_id>', methods=['DELETE'])
def remove_material_from_section(section_id, material_id):
    try:
        balance_entry = Balance.query.filter_by(
            warehouse_section_id=section_id, material_id=material_id
        ).first()

        if not balance_entry:
            return jsonify({"error": "Balance entry not found"}), 404

        db.session.delete(balance_entry)
        db.session.commit()

        return jsonify({"message": "Material removed from section"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
