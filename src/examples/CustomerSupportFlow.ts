export const customerSupportFlow = {
	nodes: [
		{
			id: "trigger1",
			type: "trigger",
			position: { x: 250, y: 50 },
			data: {
				label: "客户请求",
				description: "接收客户支持请求",
				triggerType: "event",
			},
		},
		{
			id: "process1",
			type: "process",
			position: { x: 250, y: 200 },
			data: {
				label: "请求分类",
				description: "分析并分类客户请求",
				processType: "aiCompletion",
				parameters: JSON.stringify(
					{
						model: "gpt-3.5-turbo",
						temperature: 0.3,
						systemPrompt:
							"分析以下客户请求，并将其分类为以下类别之一：技术问题、账单问题、产品咨询、投诉、其他。",
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
				label: "是否需要人工",
				description: "判断是否需要人工处理",
				condition: 'request.complexity > 0.7 || request.category == "投诉"',
				trueLabel: "需要",
				falseLabel: "不需要",
			},
		},
		{
			id: "process2",
			type: "process",
			position: { x: 100, y: 500 },
			data: {
				label: "自动回复",
				description: "生成自动回复",
				processType: "aiCompletion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.7,
						maxTokens: 800,
						systemPrompt: "生成一个友好、专业的回复，解决客户的问题。",
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
				label: "人工分配",
				description: "将请求分配给合适的客服人员",
				processType: "apiCall",
				parameters: JSON.stringify(
					{
						endpoint: "/api/assign-agent",
						method: "POST",
						priority: "high",
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
				label: "发送回复",
				description: "向客户发送自动回复",
				outputFormat: "text",
			},
		},
		{
			id: "output2",
			type: "output",
			position: { x: 400, y: 650 },
			data: {
				label: "创建工单",
				description: "创建客服工单",
				outputFormat: "json",
			},
		},
	],
	edges: [
		{ id: "e1-2", source: "trigger1", target: "process1" },
		{ id: "e2-3", source: "process1", target: "condition1" },
		{ id: "e3-4", source: "condition1", target: "process2", sourceHandle: "false" },
		{ id: "e3-5", source: "condition1", target: "process3", sourceHandle: "true" },
		{ id: "e4-6", source: "process2", target: "output1" },
		{ id: "e5-7", source: "process3", target: "output2" },
	],
};
