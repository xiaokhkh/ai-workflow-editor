export const dataProcessingFlow = {
	nodes: [
		{
			id: "trigger1",
			type: "trigger",
			position: { x: 250, y: 50 },
			data: {
				label: "数据输入",
				description: "接收原始数据",
				triggerType: "webhook",
			},
		},
		{
			id: "process1",
			type: "process",
			position: { x: 250, y: 200 },
			data: {
				label: "数据清洗",
				description: "清理和标准化数据",
				processType: "transform",
				parameters: JSON.stringify(
					{
						removeNulls: true,
						standardizeFormat: true,
						removeDuplicates: true,
					},
					null,
					2
				),
			},
		},
		{
			id: "condition1",
			type: "condition",
			position: { x: 250, y: 350 },
			data: {
				label: "数据验证",
				description: "检查数据是否有效",
				condition: "is_valid_data(input)",
				trueLabel: "有效",
				falseLabel: "无效",
			},
		},
		{
			id: "process2",
			type: "process",
			position: { x: 100, y: 500 },
			data: {
				label: "错误处理",
				description: "处理无效数据",
				processType: "transform",
				parameters: JSON.stringify(
					{
						action: "log_error",
						notifyAdmin: true,
					},
					null,
					2
				),
			},
		},
		{
			id: "process3",
			type: "process",
			position: { x: 400, y: 500 },
			data: {
				label: "数据分析",
				description: "分析有效数据",
				processType: "apiCall",
				parameters: JSON.stringify(
					{
						endpoint: "/api/analyze",
						method: "POST",
						timeout: 30000,
					},
					null,
					2
				),
			},
		},
		{
			id: "process4",
			type: "process",
			position: { x: 400, y: 650 },
			data: {
				label: "报告生成",
				description: "生成数据分析报告",
				processType: "aiCompletion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.2,
						maxTokens: 2000,
						systemPrompt: "根据以下数据分析结果生成一份专业的报告。",
					},
					null,
					2
				),
			},
		},
		{
			id: "output1",
			type: "output",
			position: { x: 100, y: 650 },
			data: {
				label: "错误通知",
				description: "发送错误通知",
				outputFormat: "json",
			},
		},
		{
			id: "output2",
			type: "output",
			position: { x: 400, y: 800 },
			data: {
				label: "分析报告",
				description: "输出最终分析报告",
				outputFormat: "html",
			},
		},
	],
	edges: [
		{ id: "e1-2", source: "trigger1", target: "process1" },
		{ id: "e2-3", source: "process1", target: "condition1" },
		{ id: "e3-4", source: "condition1", target: "process2", sourceHandle: "false" },
		{ id: "e3-5", source: "condition1", target: "process3", sourceHandle: "true" },
		{ id: "e4-7", source: "process2", target: "output1" },
		{ id: "e5-6", source: "process3", target: "process4" },
		{ id: "e6-8", source: "process4", target: "output2" },
	],
};
