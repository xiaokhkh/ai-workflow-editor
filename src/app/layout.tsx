import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "AI工作流编辑器",
	description: "可视化AI工作流设计与编辑工具",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh">
			<body>{children}</body>
		</html>
	);
}
