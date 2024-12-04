import React from "react";
import { Layout, Menu } from "antd";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Placement from "./components/Placement";
import Supplies from "./components/Supplies";
import Requests from "./components/Requests";
import Reports from "./components/Reports";
import Inventory from "./components/Inventory";

const { Header, Content, Footer } = Layout;

const App = () => (
	<Router>
		<Layout className="layout">
			<Header>
				<Menu theme="dark" mode="horizontal">
					<Menu.Item key="1">
						<Link to="/">Поставки</Link>
					</Menu.Item>
					<Menu.Item key="2">
						<Link to="/placement">Размещение</Link>
					</Menu.Item>
					<Menu.Item key="3">
						<Link to="/inventory">Инвентарь</Link>
					</Menu.Item>
					<Menu.Item key="4">
						<Link to="/requests">Запросы на выдачу</Link>
					</Menu.Item>
					<Menu.Item key="5">
						<Link to="/reports">Отчеты</Link>
					</Menu.Item>
				</Menu>
			</Header>
			<Content style={{ padding: "50px" }}>
				<Routes>
					<Route path="/" element={<Supplies />} />
					<Route path="/placement" element={<Placement />} />
					<Route path="/requests" element={<Requests />} />
					<Route path="/reports" element={<Reports />} />
					<Route path="/inventory" element={<Inventory />} />
				</Routes>
			</Content>
			<Footer style={{ textAlign: "center" }}>
				ИС материально-технического учета ©2024
			</Footer>
		</Layout>
	</Router>
);

export default App;
