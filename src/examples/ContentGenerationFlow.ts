export const contentGenerationFlow = {
	nodes: [
		{
			id: "trigger1",
			type: "trigger",
			position: { x: 250, y: 50 },
			data: {
				label: "内容请求",
				description: "接收内容生成请求",
				triggerType: "manual",
			},
		},
		{
			id: "process1",
			type: "process",
			position: { x: 250, y: 200 },
			data: {
				label: "草稿生成",
				description: "生成内容初稿",
				processType: "aiCompletion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.8,
						maxTokens: 1000,
					},
					null,
					2
				),
			},
		},
		{
			id: "process2",
			type: "process",
			position: { x: 250, y: 350 },
			data: {
				label: "内容优化",
				description: "改进和润色内容",
				processType: "aiCompletion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.4,
						maxTokens: 1500,
						systemPrompt: "优化以下内容，提高其清晰度、吸引力和专业性，但保持原意不变。",
					},
					null,
					2
				),
			},
		},
		{
			id: "condition1",
			type: "condition",
			position: { x: 250, y: 500 },
			data: {
				label: "质量检查",
				description: "评估内容质量",
				condition: "quality_score > 0.8",
				trueLabel: "通过",
				falseLabel: "不通过",
			},
		},
		{
			id: "process3",
			type: "process",
			position: { x: 400, y: 650 },
			data: {
				label: "内容修正",
				description: "修复内容问题",
				processType: "aiCompletion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.3,
						maxTokens: 1000,
						systemPrompt: "修复以下内容中的问题，提高其质量。",
					},
					null,
					2
				),
			},
		},
		{
			id: "output1",
			type: "output",
			position: { x: 250, y: 800 },
			data: {
				label: "最终内容",
				description: "输出最终优化的内容",
				outputFormat: "markdown",
			},
		},
	],
	edges: [
		{ id: "e1-2", source: "trigger1", target: "process1" },
		{ id: "e2-3", source: "process1", target: "process2" },
		{ id: "e3-4", source: "process2", target: "condition1" },
		{ id: "e4-5", source: "condition1", target: "process3", sourceHandle: "false" },
		{ id: "e4-6", source: "condition1", target: "output1", sourceHandle: "true" },
		{ id: "e5-4", source: "process3", target: "condition1" },
	],
};
