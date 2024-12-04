import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form, Select, Input, notification } from "antd";
import axios from "axios";

const { Option } = Select;

const Requests = () => {
	const [requests, setRequests] = useState([]);
	const [clients, setClients] = useState([]);
	const [materials, setMaterials] = useState([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedMaterial, setSelectedMaterial] = useState(null);
	const [selectedClient, setSelectedClient] = useState(null);
	const [form] = Form.useForm();

	useEffect(() => {
		// Fetch all requests
		axios
			.get("http://127.0.0.1:5000/api/requests")
			.then((response) => {
				setRequests(response.data);
			})
			.catch((error) => {
				console.error("Error fetching requests:", error);
			});

		// Fetch available materials
		axios
			.get("http://127.0.0.1:5000/api/materials-available")
			.then((response) => {
				setMaterials(response.data);
			})
			.catch((error) => {
				console.error("Error fetching materials:", error);
			});

		// Fetch clients (you can replace this with actual clients data from your API)
		axios
			.get("http://127.0.0.1:5000/api/clients")
			.then((response) => {
				setClients(response.data);
			})
			.catch((error) => {
				console.error("Error fetching clients:", error);
			});
	}, []);

	// Show modal
	const showModal = () => {
		setIsModalVisible(true);
	};

	// Handle modal cancel
	const handleCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
	};

	// Handle form submit to create a new request
	const handleSubmit = (values) => {
		const newRequest = {
			client_id: selectedClient,
			material_id: selectedMaterial,
		};

		axios
			.post("http://127.0.0.1:5000/api/requests", newRequest)
			.then((response) => {
				notification.success({
					message: "Request Created",
					description: "The request has been successfully created.",
				});
				setRequests([...requests, response.data]);
				handleCancel();
			})
			.catch((error) => {
				notification.error({
					message: "Error",
					description:
						"An error occurred while creating the request.",
				});
			});
	};

	// Handle accept request
	const handleAccept = (requestId) => {
		axios
			.put(`http://127.0.0.1:5000/api/requests/${requestId}/accept`)
			.then((response) => {
				notification.success({
					message: "Request Accepted",
					description: "The request has been successfully accepted.",
				});
				setRequests(
					requests.map((r) =>
						r.id === requestId ? response.data : r
					)
				);
			})
			.catch((error) => {
				notification.error({
					message: "Error",
					description:
						"An error occurred while accepting the request.",
				});
			});
	};

	// Handle cancel request
	const handleCancelRequest = (requestId) => {
		axios
			.put(`http://127.0.0.1:5000/api/requests/${requestId}/cancel`)
			.then((response) => {
				notification.success({
					message: "Request Canceled",
					description: "The request has been successfully canceled.",
				});
				setRequests(requests.filter((r) => r.id !== requestId));
			})
			.catch((error) => {
				notification.error({
					message: "Error",
					description:
						"An error occurred while canceling the request.",
				});
			});
	};

	const columns = [
		{
			title: "Client",
			dataIndex: "client_name",
			key: "client_name",
		},
		{
			title: "Material",
			dataIndex: "material_name",
			key: "material_name",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<div>
					{record.status === "INWORK" && (
						<>
							<Button
								onClick={() => handleAccept(record.id)}
								type="primary"
								style={{ marginRight: 8 }}
							>
								Accept
							</Button>
							<Button
								onClick={() => handleCancelRequest(record.id)}
								type="danger"
							>
								Cancel
							</Button>
						</>
					)}
				</div>
			),
		},
	];

	return (
		<div>
			<Button type="primary" onClick={showModal}>
				Create Request
			</Button>

			<Table
				dataSource={requests}
				columns={columns}
				rowKey="id"
				style={{ marginTop: 20 }}
			/>

			<Modal
				title="Create Request"
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={null}
			>
				<Form form={form} onFinish={handleSubmit}>
					<Form.Item
						name="client_id"
						label="Select Client"
						rules={[
							{
								required: true,
								message: "Please select a client",
							},
						]}
					>
						<Select
							placeholder="Select a client"
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
						name="material_id"
						label="Select Material"
						rules={[
							{
								required: true,
								message: "Please select a material",
							},
						]}
					>
						<Select
							placeholder="Select material"
							onChange={setSelectedMaterial}
						>
							{materials.map((material) => (
								<Option key={material.id} value={material.id}>
									{material.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit">
							Submit
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Requests;
