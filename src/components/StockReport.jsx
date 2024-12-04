import React, { useState, useEffect } from "react";
import { Table, Input, Button, notification } from "antd";
import axios from "axios";

const StockReport = () => {
	const [stockData, setStockData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [search, setSearch] = useState("");

	useEffect(() => {
		// Загружаем данные о запасах с API
		axios
			.get("http://127.0.0.1:5000/api/stock-report")
			.then((response) => {
				setStockData(response.data);
				setFilteredData(response.data); // Изначально показываем все данные
			})
			.catch((error) => {
				notification.error({
					message: "Ошибка",
					description: "Не удалось загрузить данные о запасах.",
				});
			});
	}, []);

	// Фильтрация данных по имени материала или складской секции
	const handleSearch = (value) => {
		setSearch(value);
		const lowercasedValue = value.toLowerCase();
		const filtered = stockData.filter(
			(item) =>
				item.material_name.toLowerCase().includes(lowercasedValue) ||
				item.section_name.toLowerCase().includes(lowercasedValue)
		);
		setFilteredData(filtered);
	};

	const columns = [
		{
			title: "Материал",
			dataIndex: "material_name",
			key: "material_name",
		},
		{
			title: "Секця",
			dataIndex: "section_name",
			key: "section_name",
		},
		{
			title: "Текущий запас",
			dataIndex: "current_stock",
			key: "current_stock",
		},
		{
			title: "Поставлено",
			dataIndex: "supplied",
			key: "supplied",
		},
		{
			title: "Выдано",
			dataIndex: "requested",
			key: "requested",
		},
		{
			title: "Поставки",
			dataIndex: "supply_details",
			key: "supply_details",
			render: (supply_details) => (
				<div>
					{supply_details.map((detail, index) => (
						<div key={index}>
							Поставщик: {detail.supplier_name}, Дата:{" "}
							{detail.supply_date}
						</div>
					))}
				</div>
			),
		},
		{
			title: "Запросы",
			dataIndex: "request_details",
			key: "request_details",
			render: (request_details) => (
				<div>
					{request_details.map((detail, index) => (
						<div key={index}>
							Клиент: {detail.client_name}, Дата:{" "}
							{detail.request_date}
						</div>
					))}
				</div>
			),
		},
	];

	return (
		<div>
			<Input
				placeholder="Поиск по материалам или секциям"
				value={search}
				onChange={(e) => handleSearch(e.target.value)}
				style={{ marginBottom: 20, width: 300 }}
			/>
			<Table
				dataSource={filteredData}
				columns={columns}
				rowKey="material_name"
				pagination={false}
				style={{ marginTop: 20 }}
			/>
		</div>
	);
};

export default StockReport;
