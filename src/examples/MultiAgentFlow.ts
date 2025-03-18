export const multiAgentFlow = {
	nodes: [
		{
			id: "trigger1",
			type: "trigger",
			position: { x: 250, y: 50 },
			data: {
				label: "用户请求",
				description: "接收用户的复杂问题",
				triggerType: "manual",
				backgroundColor: "#e6f7ff",
				borderColor: "#1890ff",
			},
		},
		{
			id: "process1",
			type: "process",
			position: { x: 250, y: 200 },
			data: {
				label: "问题分解",
				description: "将复杂问题分解为子任务",
				processType: "ai-completion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.3,
						maxTokens: 1000,
						systemPrompt:
							"你是一个任务规划专家。请将用户的复杂问题分解为多个子任务，以便多个专家协作解决。",
					},
					null,
					2
				),
				backgroundColor: "#f0f5ff",
				borderColor: "#2f54eb",
			},
		},
		{
			id: "process2",
			type: "process",
			position: { x: 100, y: 350 },
			data: {
				label: "研究专家",
				description: "负责信息收集和研究",
				processType: "ai-completion",
				parameters: JSON.stringify(
					{
						model: "claude-3-opus",
						temperature: 0.2,
						maxTokens: 2000,
						systemPrompt:
							"你是一个研究专家，擅长收集和分析信息。请针对分配给你的子任务提供深入的研究和分析。",
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
			position: { x: 400, y: 350 },
			data: {
				label: "创意专家",
				description: "负责创新解决方案",
				processType: "ai-completion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.7,
						maxTokens: 1500,
						systemPrompt:
							"你是一个创意专家，擅长提出创新的解决方案。请针对分配给你的子任务提供创新的思路和方法。",
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
			position: { x: 250, y: 500 },
			data: {
				label: "结果整合",
				description: "整合各专家的结果",
				processType: "ai-completion",
				parameters: JSON.stringify(
					{
						model: "claude-3-sonnet",
						temperature: 0.3,
						maxTokens: 2000,
						systemPrompt:
							"你是一个整合专家，擅长将多个专家的输入整合为连贯的解决方案。请整合所有专家的回答，形成一个完整的解决方案。",
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
			position: { x: 250, y: 650 },
			data: {
				label: "质量检查",
				description: "检查解决方案质量",
				condition: "solution_quality_score > 8",
				trueLabel: "高质量",
				falseLabel: "需改进",
				backgroundColor: "#fff7e6",
				borderColor: "#fa8c16",
			},
		},
		{
			id: "process5",
			type: "process",
			position: { x: 400, y: 750 },
			data: {
				label: "质量改进",
				description: "改进解决方案质量",
				processType: "ai-completion",
				parameters: JSON.stringify(
					{
						model: "gpt-4",
						temperature: 0.3,
						maxTokens: 1500,
						systemPrompt:
							"你是一个质量控制专家。请审查并改进以下解决方案，确保其全面、准确且有用。",
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
			position: { x: 250, y: 900 },
			data: {
				label: "最终解决方案",
				description: "向用户提供完整解决方案",
				outputType: "markdown",
				backgroundColor: "#f6ffed",
				borderColor: "#52c41a",
			},
		},
	],
	edges: [
		{ id: "e1-2", source: "trigger1", target: "process1" },
		{ id: "e2-3", source: "process1", target: "process2" },
		{ id: "e2-4", source: "process1", target: "process3" },
		{ id: "e3-5", source: "process2", target: "process4" },
		{ id: "e4-5", source: "process3", target: "process4" },
		{ id: "e5-6", source: "process4", target: "condition1" },
		{ id: "e6-7", source: "condition1", target: "process5", sourceHandle: "false" },
		{ id: "e6-8", source: "condition1", target: "output1", sourceHandle: "true" },
		{ id: "e7-6", source: "process5", target: "condition1" },
	],
};
