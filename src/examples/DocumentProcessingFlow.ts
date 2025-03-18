export const documentProcessingFlow = {
	nodes: [
		{
			id: "trigger1",
			type: "trigger",
			position: { x: 250, y: 50 },
			data: {
				label: "文档上传",
				description: "接收用户上传的文档",
				triggerType: "webhook",
				webhookPath: "/api/document-upload",
				backgroundColor: "#e6f7ff",
				borderColor: "#1890ff",
			},
		},
		{
			id: "process1",
			type: "process",
			position: { x: 250, y: 200 },
			data: {
				label: "文档解析",
				description: "提取文档内容和结构",
				processType: "transform",
				parameters: JSON.stringify(
					{
						extractText: true,
						preserveStructure: true,
						extractMetadata: true,
					},
					null,
					2
				),
				backgroundColor: "#f0f5ff",
				borderColor: "#2f54eb",
			},
		},
		{
			id: "condition1",
			type: "condition",
			position: { x: 250, y: 350 },
			data: {
				label: "文档类型检查",
				description: "确定文档类型",
				condition: "document.type === 'contract'",
				trueLabel: "合同",
				falseLabel: "其他",
				backgroundColor: "#fff7e6",
				borderColor: "#fa8c16",
			},
		},
		{
			id: "process2",
			type: "process",
			position: { x: 100, y: 500 },
			data: {
				label: "合同分析",
				description: "分析合同条款和风险",
				processType: "ai-completion",
				parameters: JSON.stringify(
					{
						model: "claude-3-opus",
						temperature: 0.1,
						maxTokens: 3000,
						systemPrompt:
							"你是一位法律专家。请分析以下合同文档，识别关键条款、潜在风险和需要注意的事项。",
					},
					null,
					2
				),
				backgroundColor: "#f0f5ff",
				borderColor: "#2f54eb",
			},
		},
		{
			id: "process3",
			type: "process",
			position: { x: 400, y: 500 },
			data: {
				label: "一般文档分析",
				description: "提取文档关键信息",
				processType: "ai-completion",
				parameters: JSON.stringify(
					{
						model: "gpt-3.5-turbo",
						temperature: 0.3,
						maxTokens: 1500,
						systemPrompt:
							"请分析以下文档，提取关键信息并生成摘要。识别文档的主要主题、关键点和重要细节。",
					},
					null,
					2
				),
				backgroundColor: "#f0f5ff",
				borderColor: "#2f54eb",
			},
		},
		{
			id: "process4",
			type: "process",
			position: { x: 100, y: 650 },
			data: {
				label: "合同摘要生成",
				description: "生成合同关键点摘要",
				processType: "ai-completion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.2,
						maxTokens: 1000,
						systemPrompt:
							"基于以下合同分析，生成一份简明的摘要，突出显示关键条款、义务、截止日期和潜在风险。",
					},
					null,
					2
				),
				backgroundColor: "#f0f5ff",
				borderColor: "#2f54eb",
			},
		},
		{
			id: "process5",
			type: "process",
			position: { x: 250, y: 800 },
			data: {
				label: "格式化输出",
				description: "将分析结果格式化为结构化报告",
				processType: "transform",
				parameters: JSON.stringify(
					{
						format: "structured",
						includeMetadata: true,
						highlightKeyPoints: true,
					},
					null,
					2
				),
				backgroundColor: "#f0f5ff",
				borderColor: "#2f54eb",
			},
		},
		{
			id: "output1",
			type: "output",
			position: { x: 250, y: 950 },
			data: {
				label: "文档分析报告",
				description: "输出最终分析报告",
				outputType: "html",
				backgroundColor: "#f6ffed",
				borderColor: "#52c41a",
			},
		},
	],
	edges: [
		{ id: "e1-2", source: "trigger1", target: "process1" },
		{ id: "e2-3", source: "process1", target: "condition1" },
		{ id: "e3-4", source: "condition1", target: "process2", sourceHandle: "true" },
		{ id: "e3-5", source: "condition1", target: "process3", sourceHandle: "false" },
		{ id: "e4-6", source: "process2", target: "process4" },
		{ id: "e5-7", source: "process3", target: "process5" },
		{ id: "e6-7", source: "process4", target: "process5" },
		{ id: "e7-8", source: "process5", target: "output1" },
	],
};
