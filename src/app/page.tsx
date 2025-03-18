"use client";

import { useEffect, useState } from "react";

import { ReactFlowProvider } from "reactflow";
import WorkflowEditor from "./workflow-editor/page";

export default function Home() {
	const [isClient, setIsClient] = useState(false);

	// 使用 useEffect 确保只在客户端渲染
	useEffect(() => {
		setIsClient(true);
	}, []);

	// 如果不是客户端，显示加载状态
	if (!isClient) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">AI工作流编辑器</h1>
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-300">正在加载编辑器...</p>
				</div>
			</div>
		);
	}

	return (
		<ReactFlowProvider>
			<WorkflowEditor />
		</ReactFlowProvider>
	);
}
