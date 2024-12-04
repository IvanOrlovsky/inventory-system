import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Select, Table, message } from "antd";
import axios from "axios";

const { Option } = Select;

const Placement = () => {
	const [unplacedMaterials, setUnplacedMaterials] = useState([]);
	const [warehouseSections, setWarehouseSections] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedMaterial, setSelectedMaterial] = useState(null);
	const [loading, setLoading] = useState(false);

	const [form] = Form.useForm();

	useEffect(() => {
		fetchUnplacedMaterials();
		fetchWarehouseSections();
	}, []);

	const fetchUnplacedMaterials = async () => {
		try {
			const response = await axios.get(
				"http://127.0.0.1:5000/api/materials/available-for-placing"
			);
			setUnplacedMaterials(response.data);
		} catch (error) {
			message.error("Не удалось получить неразмещенные материалы");
		}
	};

	const fetchWarehouseSections = async () => {
		try {
			const response = await axios.get(
				"http://127.0.0.1:5000/api/warehouse_sections"
			);
			setWarehouseSections(response.data);
		} catch (error) {
			message.error("Не удалось получить секции склада");
		}
	};

	const placeMaterial = async (values) => {
		setLoading(true);
		try {
			await axios.post("http://127.0.0.1:5000/api/balances", {
				material_id: selectedMaterial.id,
				warehouse_section_id: values.warehouse_section_id,
				quantity: selectedMaterial.quantity,
			});
			message.success("Материал успешно размещен!");
			setIsModalVisible(false);
			fetchUnplacedMaterials();
			form.resetFields();
		} catch (error) {
			message.error(
				"Не удалось разместить материал! Проверьте введенные данные."
			);
		} finally {
			setLoading(false);
		}
	};

	const showModal = (material) => {
		setSelectedMaterial(material);
		setIsModalVisible(true);
	};

	const handleOk = () => {
		form.validateFields()
			.then((values) => {
				placeMaterial(values);
			})
			.catch((info) => {
				console.log("Validate Failed:", info);
			});
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
	};

	return (
		<div>
			<Table
				dataSource={unplacedMaterials}
				rowKey="id"
				style={{ marginBottom: 20 }}
			>
				<Table.Column
					title="Наименование материала"
					dataIndex="name"
					key="name"
				/>
				<Table.Column
					title="Количество"
					dataIndex="quantity"
					key="quantity"
				/>
				<Table.Column
					title="Действия"
					key="actions"
					render={(_, record) => (
						<Button
							type="primary"
							onClick={() => showModal(record)}
						>
							Разместить
						</Button>
					)}
				/>
			</Table>

			<Modal
				title={`Размещение материала: ${
					selectedMaterial ? selectedMaterial.name : ""
				}`}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
				confirmLoading={loading}
			>
				<Form form={form} layout="vertical" name="placeMaterialForm">
					<Form.Item
						label="Выберите секцию склада"
						name="warehouse_section_id"
						rules={[
							{
								required: true,
								message: "Пожалуйста, выберите секцию склада!",
							},
						]}
					>
						<Select
							placeholder="Выберите секцию"
							style={{ width: "100%" }}
						>
							{warehouseSections.map((section) => (
								<Option key={section.id} value={section.id}>
									{section.name}
								</Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Placement;
