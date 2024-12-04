import React, { useEffect, useState } from "react";
import { Table, Tabs } from "antd";
import axios from "axios";

const Reports = () => {
	const [reports, setReports] = useState({
		materials: [],
		supplies: [],
		requests: [],
		suppliers: [],
		customers: [],
		sections: [],
	});

	const fetchReports = async () => {
		const response = await axios.get("http://127.0.0.1:5000/reports");
		setReports(response.data);
	};

	useEffect(() => {
		fetchReports();
	}, []);

	const columnsMaterials = [
		{ title: "ID", dataIndex: "id", key: "id" },
		{ title: "Название", dataIndex: "name", key: "name" },
		{ title: "Категория", dataIndex: "category", key: "category" },
		{ title: "Количество", dataIndex: "quantity", key: "quantity" },
	];

	const columnsSupplies = [
		{ title: "ID", dataIndex: "id", key: "id" },
		{
			title: "ID материального ресурса",
			dataIndex: "material_id",
			key: "material_id",
		},
		{
			title: "ID поставщика",
			dataIndex: "supplier_id",
			key: "supplier_id",
		},
		{ title: "Количество", dataIndex: "quantity", key: "quantity" },
		{ title: "Дата", dataIndex: "date", key: "date" },
	];

	const columnsRequests = [
		{ title: "ID", dataIndex: "id", key: "id" },
		{
			title: "ID материального ресурса",
			dataIndex: "material_id",
			key: "material_id",
		},
		{ title: "ID клиента", dataIndex: "customer_id", key: "customer_id" },
		{ title: "Количество", dataIndex: "quantity", key: "quantity" },
		{ title: "Статус", dataIndex: "status", key: "status" },
		{ title: "Дата", dataIndex: "date", key: "date" },
	];

	const columnsSuppliers = [
		{ title: "ID", dataIndex: "id", key: "id" },
		{
			title: "Название компании",
			dataIndex: "company_name",
			key: "company_name",
		},
		{
			title: "Контактная информация",
			dataIndex: "contact_info",
			key: "contact_info",
		},
	];

	const columnsCustomers = [
		{ title: "ID", dataIndex: "id", key: "id" },
		{ title: "Имя", dataIndex: "name", key: "name" },
		{ title: "Контакты", dataIndex: "contact_info", key: "contact_info" },
	];

	const columnsSections = [
		{ title: "ID", dataIndex: "id", key: "id" },
		{ title: "Название", dataIndex: "name", key: "name" },
	];

	return (
		<Tabs defaultActiveKey="1">
			<Tabs.TabPane tab="Материальные ресурсы" key="1">
				<Table
					dataSource={reports.materials}
					columns={columnsMaterials}
					rowKey="id"
				/>
			</Tabs.TabPane>
			<Tabs.TabPane tab="Поставки" key="2">
				<Table
					dataSource={reports.supplies}
					columns={columnsSupplies}
					rowKey="id"
				/>
			</Tabs.TabPane>
			<Tabs.TabPane tab="Запросы на выдачу" key="3">
				<Table
					dataSource={reports.requests}
					columns={columnsRequests}
					rowKey="id"
				/>
			</Tabs.TabPane>
			<Tabs.TabPane tab="Поставщики" key="4">
				<Table
					dataSource={reports.suppliers}
					columns={columnsSuppliers}
					rowKey="id"
				/>
			</Tabs.TabPane>
			<Tabs.TabPane tab="Клиенты" key="5">
				<Table
					dataSource={reports.customers}
					columns={columnsCustomers}
					rowKey="id"
				/>
			</Tabs.TabPane>
			<Tabs.TabPane tab="Складские секции" key="6">
				<Table
					dataSource={reports.sections}
					columns={columnsSections}
					rowKey="id"
				/>
			</Tabs.TabPane>
		</Tabs>
	);
};

export default Reports;
