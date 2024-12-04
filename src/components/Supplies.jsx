import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Select, Table, InputNumber, message } from "antd";
import axios from "axios";

const { Column } = Table;
const { Option } = Select;

const Supplies = () => {
	const [supplies, setSupplies] = useState([]);
	const [suppliers, setSuppliers] = useState([]);
	const [materials, setMaterials] = useState([]);
	const [selectedMaterials, setSelectedMaterials] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [loading, setLoading] = useState(false);

	const [form] = Form.useForm();

	useEffect(() => {
		fetchSupplies();
		fetchSuppliers();
		fetchMaterials();
	}, []);

	const fetchSupplies = async () => {
		try {
			const response = await axios.get(
				"http://127.0.0.1:5000/api/supplies"
			);
			setSupplies(response.data);
		} catch (error) {
			message.error("Не удалось получить данные поставок");
		}
	};

	const fetchSuppliers = async () => {
		try {
			const response = await axios.get(
				"http://127.0.0.1:5000/api/suppliers"
			);
			setSuppliers(response.data);
		} catch (error) {
			message.error("Не удалось получить данные поставщиков");
		}
	};

	const fetchMaterials = async () => {
		try {
			const response = await axios.get(
				"http://127.0.0.1:5000/api/materials"
			);
			setMaterials(response.data);
		} catch (error) {
			message.error("Не удалось получить данные материалов");
		}
	};

	const createSupply = async (values) => {
		setLoading(true);
		try {
			await axios.post("http://127.0.0.1:5000/api/supplies", {
				supplier_id: values.supplier_id,
				materials: selectedMaterials,
			});
			message.success("Заявка на поставку материалов успешно принята!");
			setIsModalVisible(false);
			fetchSupplies();
			form.resetFields();
			setSelectedMaterials([]);
		} catch (error) {
			message.error("Не удалось создать заявку на поставку материалов!");
		} finally {
			setLoading(false);
		}
	};

	const handleMaterialChange = (value) => {
		const updatedMaterials = value.map((id) => {
			const existing = selectedMaterials.find((item) => item.id === id);
			return existing || { id, quantity: 1 };
		});
		setSelectedMaterials(updatedMaterials);
	};

	const handleQuantityChange = (id, quantity) => {
		setSelectedMaterials((prev) =>
			prev.map((item) => (item.id === id ? { ...item, quantity } : item))
		);
	};

	const handleOk = () => {
		form.validateFields()
			.then((values) => {
				createSupply(values);
			})
			.catch((info) => {
				console.log("Validate Failed:", info);
			});
	};

	const acceptSupply = async (supplyId) => {
		try {
			await axios.patch(
				`http://127.0.0.1:5000/api/supplies/${supplyId}/accept`
			);
			message.success("Поставка успешно принята!");
			fetchSupplies();
		} catch (error) {
			message.error("Не удалось принять поставку!");
		}
	};

	return (
		<div>
			<Button type="primary" onClick={() => setIsModalVisible(true)}>
				Создать заявку на поставку
			</Button>
			<Modal
				title="Создать заявку на поставку"
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={() => setIsModalVisible(false)}
				confirmLoading={loading}
			>
				<Form form={form} layout="vertical" name="createSupplyForm">
					<Form.Item
						label="Поставщик"
						name="supplier_id"
						rules={[
							{
								required: true,
								message: "Пожалуйста, выберите поставщика!",
							},
						]}
					>
						<Select placeholder="Выберите поставщика">
							{suppliers.map((supplier) => (
								<Option key={supplier.id} value={supplier.id}>
									{supplier.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						label="Материалы"
						name="material_ids"
						rules={[
							{
								required: true,
								message:
									"Пожалуйста, выберите хотя бы один материал!",
							},
						]}
					>
						<Select
							mode="multiple"
							placeholder="Выберите материалы"
							onChange={handleMaterialChange}
							allowClear
						>
							{materials.map((material) => (
								<Option key={material.id} value={material.id}>
									{material.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					{selectedMaterials.map((material) => (
						<div key={material.id} style={{ marginBottom: 8 }}>
							<strong>
								{
									materials.find((m) => m.id === material.id)
										?.name
								}
								:
							</strong>
							<InputNumber
								min={1}
								value={material.quantity}
								onChange={(value) =>
									handleQuantityChange(material.id, value)
								}
								style={{ marginLeft: 8 }}
							/>
						</div>
					))}
				</Form>
			</Modal>

			<Table dataSource={supplies} rowKey="id" style={{ marginTop: 20 }}>
				<Column
					title="Дата создания заявки"
					dataIndex="date_of_creation"
					key="date_of_creation"
				/>
				<Column
					title="Поставщик"
					dataIndex="supplier_name"
					key="supplier_name"
				/>
				<Column
					title="Статус поставки"
					dataIndex="status"
					key="status"
				/>
				<Column
					title="Материалы в поставке"
					dataIndex="materials"
					key="materials"
					render={(materials) =>
						materials
							.map(
								(material) =>
									`${material.name} (${material.quantity})`
							)
							.join(", ")
					}
				/>
				<Column
					title="Принять"
					key="actions"
					render={(_, record) => (
						<Button
							type="primary"
							onClick={() => acceptSupply(record.id)}
							disabled={record.status === "принят"}
						>
							{record.status === "принят" ? "Принята" : "Принять"}
						</Button>
					)}
				/>
			</Table>
		</div>
	);
};

export default Supplies;
