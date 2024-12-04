import React, { useState, useEffect } from "react";
import {
	Modal,
	Button,
	Table,
	Form,
	Select,
	Input,
	InputNumber,
	notification,
} from "antd";
import axios from "axios";

const { Option } = Select;

const Requests = () => {
	const [requests, setRequests] = useState([]);
	const [clients, setClients] = useState([]);
	const [materials, setMaterials] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedClient, setSelectedClient] = useState(null);
	const [selectedMaterials, setSelectedMaterials] = useState([]);
	const [form] = Form.useForm();

	const [loading, setLoading] = useState(true);

	const fetchAllData = async () => {
		setLoading(true); // Устанавливаем флаг загрузки

		try {
			const [requestsRes, materialsRes, clientsRes] = await Promise.all([
				axios.get("http://127.0.0.1:5000/api/requests"),
				axios.get("http://127.0.0.1:5000/api/materials-available"),
				axios.get("http://127.0.0.1:5000/api/clients"),
			]);

			setRequests(requestsRes.data);
			setMaterials(materialsRes.data);
			setClients(clientsRes.data);
		} catch (error) {
			console.error("Ошибка при загрузке данных:", error);
		} finally {
			setLoading(false); // Снимаем флаг загрузки
		}
	};

	useEffect(() => {
		fetchAllData();
	}, []);

	// Показать модальное окно
	const showModal = () => {
		setIsModalVisible(true);
	};

	// Закрыть модальное окно
	const handleCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
		setSelectedMaterials([]);
	};

	// Обработчик изменения выбранных материалов
	const handleMaterialChange = (value) => {
		const updatedMaterials = value.map((materialId) => ({
			id: materialId,
			quantity: 1, // по умолчанию количество равно 1
		}));
		setSelectedMaterials(updatedMaterials);
	};

	// Обработчик изменения количества материала
	const handleQuantityChange = (id, quantity) => {
		setSelectedMaterials((prevMaterials) =>
			prevMaterials.map((material) =>
				material.id === id ? { ...material, quantity } : material
			)
		);
	};

	// Обработчик отправки формы для создания нового запроса
	const handleSubmit = async (values) => {
		const newRequest = {
			client_id: selectedClient,
			materials: selectedMaterials.map((item) => ({
				material_id: item.id,
				quantity: item.quantity,
			})),
		};

		try {
			const response = await axios.post(
				"http://127.0.0.1:5000/api/requests",
				newRequest
			);

			notification.success({
				message: "Запрос создан",
				description: "Запрос был успешно создан.",
			});
			setRequests([...requests, response.data.request]);
			handleCancel();
		} catch (error) {
			notification.error({
				message: "Ошибка",
				description: "Произошла ошибка при создании запроса.",
			});
		}
	};

	// Обработчик принятия запроса
	const handleAccept = (requestId) => {
		axios
			.put(`http://127.0.0.1:5000/api/requests/${requestId}/accept`)
			.then((response) => {
				notification.success({
					message: "Запрос принят",
					description: "Запрос был успешно принят.",
				});
				setRequests(
					requests.map((r) =>
						r.id === requestId ? response.data.request : r
					)
				);
			})
			.catch((error) => {
				notification.error({
					message: "Ошибка",
					description:
						"Произошла ошибка при принятии запроса. На складе не хватает материалов!",
				});
			});
	};

	// Обработчик отмены запроса
	const handleCancelRequest = (requestId) => {
		axios
			.put(`http://127.0.0.1:5000/api/requests/${requestId}/cancel`)
			.then((response) => {
				notification.success({
					message: "Запрос отменен",
					description: "Запрос был успешно отменен.",
				});
				setRequests(
					requests.map((r) =>
						r.id === requestId ? response.data.request : r
					)
				);
			})
			.catch((error) => {
				notification.error({
					message: "Ошибка",
					description: "Произошла ошибка при отмене запроса.",
				});
			});
	};

	// Столбцы для таблицы запросов
	const columns = [
		{
			title: "Клиент",
			dataIndex: "client_name",
			key: "client_name",
		},
		{
			title: "Материалы",
			dataIndex: "materials",
			key: "materials",
			render: (materials) => (
				<span>
					{materials
						.map((item) => `${item.name} (${item.quantity})`)
						.join(", ")}
				</span>
			),
		},
		{
			title: "Статус",
			dataIndex: "status",
			key: "status",
		},
		{
			title: "Действия",
			key: "actions",
			render: (text, record) => (
				<div>
					{record.status === "в работе" ? (
						<>
							<Button
								onClick={() => handleAccept(record.id)}
								type="primary"
								style={{ marginRight: 8 }}
							>
								Принять
							</Button>
							<Button
								onClick={() => handleCancelRequest(record.id)}
								type="danger"
							>
								Отменить
							</Button>
						</>
					) : record.status === "выдан" ? (
						<Button type="primary" disabled>
							Запрос выдан
						</Button>
					) : (
						<Button type="primary" disabled>
							Запрос отменен
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<div>
			<Button type="primary" onClick={showModal}>
				Создать запрос
			</Button>

			{loading ? (
				<div>Загрузка...</div>
			) : (
				<Table
					dataSource={[...requests].sort((a, b) => {
						// Сначала сортируем по статусу: "в работе" - в начало
						if (
							a.status === "в работе" &&
							b.status !== "в работе"
						) {
							return -1; // a должен быть перед b
						}
						if (
							a.status !== "в работе" &&
							b.status === "в работе"
						) {
							return 1; // b должен быть перед a
						}
						// Если статусы одинаковые, то можно сортировать по id или по дате
						return a.id - b.id; // или любой другой критерий
					})}
					columns={columns}
					rowKey="id"
					style={{ marginTop: 20 }}
				/>
			)}

			<Modal
				title="Создать запрос"
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={null}
			>
				<Form form={form} onFinish={handleSubmit}>
					<Form.Item
						name="client_id"
						label="Выберите клиента"
						rules={[
							{
								required: true,
								message: "Пожалуйста, выберите клиента",
							},
						]}
					>
						<Select
							placeholder="Выберите клиента"
							onChange={setSelectedClient}
						>
							{clients.map((client) => (
								<Option key={client.id} value={client.id}>
									{client.name}
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

					<Form.Item>
						<Button type="primary" htmlType="submit">
							Отправить
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Requests;
