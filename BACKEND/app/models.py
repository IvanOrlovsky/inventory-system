from enum import Enum
from . import db

class Client(db.Model):
    __tablename__  = 'client'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }


class Material(db.Model):
    __tablename__  = 'material'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }

class OrderStatus(Enum):
    INWORK = "в работе"
    GIVEN = "выдан"
    CANCELED = "отменен"
    
class Request(db.Model):
    __tablename__ = 'request'

    id = db.Column(db.Integer, primary_key=True)
    date_of_creation = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum(OrderStatus, create_constraint=True), default=OrderStatus.INWORK, nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    client = db.relationship('Client', backref='client_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'date_of_creation': self.date_of_creation.strftime('%Y-%m-%d'),
            'status': OrderStatus(self.status).value,
            'client_id': self.client_id,
            'client_name': self.client.name,
            'materials': [materials_in_request.material.to_dict() | {'quantity': materials_in_request.quantity}
                          for materials_in_request in self.materials_in_request]
        }

class MaterialsInRequest(db.Model):
    __tablename__ = 'materials_in_request'

    material_id = db.Column(db.Integer, db.ForeignKey('material.id'), primary_key=True)
    material = db.relationship('Material', backref='materials_in_request')
    request_id = db.Column(db.Integer, db.ForeignKey('request.id'), primary_key=True)
    request = db.relationship('Request', backref='materials_in_request')
    quantity = db.Column(db.Integer, nullable=False)

    __table_args__ = (
        db.PrimaryKeyConstraint('material_id', 'request_id'),
    )

    def to_dict(self):
        return {
            'material_id': self.material_id,
            'request_id': self.request_id,
            'quantity': self.quantity,
        }


class Supplier(db.Model):
    __tablename__ = 'supplier'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }

class SupplyStatus(Enum):
    WAITING = "ожидает приемки"
    ACCEPTED = "принят"

class Supply(db.Model):
    __tablename__ = 'supply'

    id = db.Column(db.Integer, primary_key=True)
    date_of_creation = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum(SupplyStatus, create_constraint=True), default=SupplyStatus.WAITING, nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('supplier.id'), nullable=False)
    supplier = db.relationship('Supplier', backref='supplies')

    def to_dict(self):
        return {
            'id': self.id,
            'date_of_creation': self.date_of_creation.strftime('%Y-%m-%d'),
            'status': SupplyStatus(self.status).value,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier.name,
            'materials': [materials_in_supply.material.to_dict() | {'quantity': materials_in_supply.quantity}
                          for materials_in_supply in self.supply_materials_in_supply]
        }

class MaterialsInSupply(db.Model):
    __tablename__ = 'materials_in_supply'

    material_id = db.Column(db.Integer, db.ForeignKey('material.id'), primary_key=True)
    material = db.relationship('Material', backref='materials_in_supply')
    supply_id = db.Column(db.Integer, db.ForeignKey('supply.id'), primary_key=True)
    supply = db.relationship('Supply', backref='supply_materials_in_supply')
    quantity = db.Column(db.Integer, nullable=False)

    __table_args__ = (
        db.PrimaryKeyConstraint('material_id', 'supply_id'),
    )

    def to_dict(self):
        return {
            'material_id': self.material_id,
            'supply_id': self.supply_id,
            'quantity': self.quantity,
        }


class WarehouseSection(db.Model):
    __tablename__ = 'warehouse_section'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }

class Balance(db.Model):
    __tablename__ = 'balance'

    material_id = db.Column(db.Integer, db.ForeignKey('material.id'), primary_key=True)
    material = db.relationship('Material', backref='balances')
    warehouse_section_id = db.Column(db.Integer, db.ForeignKey('warehouse_section.id'), primary_key=True)
    warehouse_section = db.relationship('WarehouseSection', backref='balances')
    quantity = db.Column(db.Integer, nullable=False)

    __table_args__ = (
        db.PrimaryKeyConstraint('material_id', 'warehouse_section_id'),
    )

    def to_dict(self):
        return {
            'material_id': self.material_id,
            'warehouse_section_id': self.warehouse_section_id,
            'quantity': self.quantity,
        }
