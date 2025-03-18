export const simpleConversationFlow = {
	nodes: [
		{
			id: "trigger1",
			type: "trigger",
			position: { x: 250, y: 50 },
			data: {
				label: "用户输入",
				description: "接收用户的问题或指令",
				triggerType: "event",
			},
		},
		{
			id: "process1",
			type: "process",
			position: { x: 250, y: 200 },
			data: {
				label: "AI处理",
				description: "分析用户意图并生成回复",
				processType: "aiCompletion",
				parameters: JSON.stringify(
					{
						model: "gpt-3.5-turbo",
						temperature: 0.7,
						maxTokens: 500,
					},
					null,
					2
				),
			},
		},
		{
			id: "output1",
			type: "output",
			position: { x: 250, y: 350 },
			data: {
				label: "回复用户",
				description: "将AI生成的回复发送给用户",
				outputFormat: "text",
			},
		},
	],
	edges: [
		{ id: "e1-2", source: "trigger1", target: "process1" },
		{ id: "e2-3", source: "process1", target: "output1" },
	],
};
