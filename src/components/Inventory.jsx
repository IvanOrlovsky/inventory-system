import React, { useEffect, useState } from "react";
import { Card, List, Button, message, Spin } from "antd";
import axios from "axios";

const Inventory = () => {
	const [sections, setSections] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchInventoryData();
	}, []);

	const fetchInventoryData = async () => {
		try {
			const response = await axios.get(
				"http://127.0.0.1:5000/api/warehouse/sections/materials"
			);
			setSections(response.data);
		} catch (error) {
			message.error("Failed to fetch inventory data.");
		} finally {
			setLoading(false);
		}
	};

	const removeMaterial = async (sectionId, materialId) => {
		try {
			await axios.delete(
				`http://127.0.0.1:5000/api/balance/${sectionId}/${materialId}`
			);
			message.success("Material removed from section.");
			fetchInventoryData(); // Refresh the inventory data
		} catch (error) {
			message.error("Failed to remove material.");
		}
	};

	return (
		<div style={{ padding: "20px" }}>
			{loading ? (
				<div style={{ textAlign: "center", marginTop: "20px" }}>
					<Spin size="large" />
				</div>
			) : (
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: "20px",
						justifyContent: "center",
					}}
				>
					{sections.map((section) => (
						<Card
							key={section.section_id}
							title={section.section_name}
							bordered
						>
							<List
								dataSource={section.materials}
								renderItem={(material) => (
									<List.Item
										actions={[
											<Button
												danger
												onClick={() =>
													removeMaterial(
														section.section_id,
														material.id
													)
												}
											>
												Убрать из секции
											</Button>,
										]}
									>
										<span>
											<b>
												{material.name}(
												{material.quantity})
											</b>
										</span>
									</List.Item>
								)}
							/>
						</Card>
					))}
				</div>
			)}
		</div>
	);
};

export default Inventory;
