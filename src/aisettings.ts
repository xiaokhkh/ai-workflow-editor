// AI工作流编辑器设置
export const editorSettings = {
	// 画布设置
	canvas: {
		gridSize: 20,
		snapToGrid: true,
		background: "#f8f9fa",
		darkModeBackground: "#1a1a1a",
	},

	// 节点设置
	nodes: {
		defaultWidth: 180,
		defaultHeight: 80,
		borderRadius: 8,
		colors: {
			trigger: "#61dafb",
			process: "#0070f3",
			condition: "#ffd700",
			output: "#10b981",
		},
	},

	// 连线设置
	edges: {
		defaultType: "bezier",
		types: ["bezier", "straight", "step"],
		strokeWidth: 2,
		markerEnd: "arrowclosed",
		color: "#888888",
		selectedColor: "#ff0072",
	},

	// 布局设置
	layout: {
		horizontal: {
			nodeGap: 100,
			levelGap: 200,
		},
		vertical: {
			nodeGap: 80,
			levelGap: 150,
		},
	},

	// 历史记录设置
	history: {
		maxStackSize: 50,
	},

	// 导出设置
	export: {
		formats: ["png", "svg", "json"],
		defaultFormat: "json",
	},
};

// 节点类型
export const nodeTypes = {
	TRIGGER: "trigger",
	PROCESS: "process",
	CONDITION: "condition",
	OUTPUT: "output",
	CUSTOM: "custom",
};

// 触发器类型选项
export const triggerTypes = [
	{ value: "user-input", label: "用户输入" },
	{ value: "schedule", label: "定时触发" },
	{ value: "webhook", label: "Webhook" },
	{ value: "api-call", label: "API调用" },
	{ value: "event", label: "事件触发" },
];

// 处理类型选项
export const processTypes = [
	{ value: "transform", label: "数据转换" },
	{ value: "api-call", label: "API调用" },
	{ value: "ai-completion", label: "AI补全" },
	{ value: "data-filtering", label: "数据过滤" },
];

// 输出类型选项
export const outputTypes = [
	{ value: "text", label: "文本" },
	{ value: "json", label: "JSON" },
	{ value: "image", label: "图片" },
	{ value: "file", label: "文件" },
	{ value: "html", label: "HTML" },
	{ value: "markdown", label: "Markdown" },
];

// AI模型选项
export const aiModels = [
	{ value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
	{ value: "gpt-4", label: "GPT-4" },
	{ value: "claude-3-opus", label: "Claude 3 Opus" },
	{ value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
	{ value: "llama-3", label: "Llama 3" },
];

// 默认参数模板
export const defaultParameters = {
	"ai-completion": {
		model: "gpt-3.5-turbo",
		temperature: 0.7,
		maxTokens: 500,
		systemPrompt: "你是一个有用的AI助手。",
	},
	"api-call": {
		endpoint: "https://api.example.com/data",
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	},
	transform: {
		transformType: "filter",
		condition: "item.value > 10",
	},
	"data-filtering": {
		filterType: "exclude",
		condition: "item.status === 'inactive'",
	},
};

// 内置工作流模板
export const templates = [
	{
		id: "simple-ai-completion",
		name: "简单AI补全流程",
		description: "用户输入触发，AI处理后输出文本结果",
		nodes: [
			{
				id: "trigger-1",
				type: "trigger",
				position: { x: 250, y: 100 },
				data: { label: "用户输入", triggerType: "user-input" },
			},
			{
				id: "process-1",
				type: "process",
				position: { x: 250, y: 200 },
				data: {
					label: "AI处理",
					processType: "ai-completion",
					parameters: JSON.stringify({
						model: "gpt-3.5-turbo",
						temperature: 0.7,
					}),
				},
			},
			{
				id: "output-1",
				type: "output",
				position: { x: 250, y: 300 },
				data: { label: "文本输出", outputType: "text" },
			},
		],
		edges: [
			{ id: "e1-2", source: "trigger-1", target: "process-1" },
			{ id: "e2-3", source: "process-1", target: "output-1" },
		],
	},
	{
		id: "conditional-workflow",
		name: "条件分支工作流",
		description: "根据条件执行不同的处理路径",
		nodes: [
			{
				id: "trigger-1",
				type: "trigger",
				position: { x: 250, y: 50 },
				data: { label: "开始", triggerType: "user-input" },
			},
			{
				id: "condition-1",
				type: "condition",
				position: { x: 250, y: 150 },
				data: { label: "条件判断", condition: "data.score > 80" },
			},
			{
				id: "process-1",
				type: "process",
				position: { x: 100, y: 250 },
				data: { label: "高分处理", processType: "transform" },
			},
			{
				id: "process-2",
				type: "process",
				position: { x: 400, y: 250 },
				data: { label: "低分处理", processType: "transform" },
			},
			{
				id: "output-1",
				type: "output",
				position: { x: 250, y: 350 },
				data: { label: "结果输出", outputType: "json" },
			},
		],
		edges: [
			{ id: "e1-2", source: "trigger-1", target: "condition-1" },
			{ id: "e2-3", source: "condition-1", target: "process-1", label: "是" },
			{ id: "e2-4", source: "condition-1", target: "process-2", label: "否" },
			{ id: "e3-5", source: "process-1", target: "output-1" },
			{ id: "e4-5", source: "process-2", target: "output-1" },
		],
	},
];
