"use client";

import { Dispatch, SetStateAction, useCallback } from "react";
import { Edge, Node } from "reactflow";

import { contentGenerationFlow } from "@/examples/ContentGenerationFlow";
import { customerSupportFlow } from "@/examples/CustomerSupportFlow";
import { dataProcessingFlow } from "@/examples/DataProcessingFlow";
import { documentProcessingFlow } from "@/examples/DocumentProcessingFlow";
import { multiAgentFlow } from "@/examples/MultiAgentFlow";
import { simpleConversationFlow } from "@/examples/SimpleConversationFlow";

interface TemplateLibraryProps {
	setNodes: Dispatch<SetStateAction<Node[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
	setHistory?: Dispatch<SetStateAction<{ past: any[]; future: any[] }>>;
}

export default function TemplateLibrary({ setNodes, setEdges, setHistory }: TemplateLibraryProps) {
	// 模板列表
	const templates = [
		{
			id: "simple-conversation",
			name: "简单对话流程",
			description: "基础的用户输入-AI响应流程",
			flow: simpleConversationFlow,
		},
		{
			id: "content-generation",
			name: "内容生成流程",
			description: "根据提示生成并优化内容的流程",
			flow: contentGenerationFlow,
		},
		{
			id: "data-processing",
			name: "数据处理流程",
			description: "处理和转换数据的多步骤流程",
			flow: dataProcessingFlow,
		},
		{
			id: "customer-support",
			name: "客户支持流程",
			description: "自动化客户支持请求处理流程",
			flow: customerSupportFlow,
		},
		{
			id: "multi-agent",
			name: "多智能体协作流程",
			description: "多个AI专家协作解决复杂问题",
			flow: multiAgentFlow,
		},
		{
			id: "document-processing",
			name: "文档处理流程",
			description: "自动分析和处理上传的文档",
			flow: documentProcessingFlow,
		},
	];

	// 加载预设模板
	const loadTemplate = useCallback(
		(templateId: string) => {
			// 查找模板
			const template = templates.find((t) => t.id === templateId);
			if (!template || !template.flow) return;

			// 如果有历史记录功能，添加当前状态到历史记录
			if (setHistory) {
				setHistory((prev) => ({
					past: [...prev.past, { nodes: [], edges: [] }], // 保存当前状态
					future: [],
				}));
			}

			// 加载模板中的节点和边
			setNodes(template.flow.nodes);
			setEdges(template.flow.edges);
		},
		[setNodes, setEdges, setHistory, templates]
	);

	return (
		<div className="relative group">
			<button className="px-3 py-1 bg-green-500 text-white rounded flex items-center space-x-1">
				<span>模板库</span>
				<svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
					<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
				</svg>
			</button>
			<div className="absolute left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg hidden group-hover:block z-10">
				{templates.map((template) => (
					<button
						key={template.id}
						className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						onClick={() => loadTemplate(template.id)}
					>
						<div className="font-medium">{template.name}</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">{template.description}</div>
					</button>
				))}
			</div>
		</div>
	);
}
