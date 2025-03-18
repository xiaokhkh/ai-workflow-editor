"use client";

import { outputTypes, processTypes, triggerTypes } from "@/aisettings";
import { useCallback, useEffect, useRef, useState } from "react";

import { Node } from "reactflow";
import NodeStatusIndicator from "./NodeStatusIndicator";

interface NodeConfigPanelProps {
	node: Node;
	updateNode: (data: any) => void;
	onDeleteNode?: (nodeId: string) => void;
}

export default function NodeConfigPanel({ node, updateNode, onDeleteNode }: NodeConfigPanelProps) {
	const nodeType = typeof node.type === "string" ? node.type : "custom";
	const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);
	const [showProcessDropdown, setShowProcessDropdown] = useState(false);
	const [showOutputDropdown, setShowOutputDropdown] = useState(false);

	// 添加本地状态以立即反映UI变化
	const [localTriggerType, setLocalTriggerType] = useState(node.data?.triggerType || "");
	const [localProcessType, setLocalProcessType] = useState(node.data?.processType || "");
	const [localOutputType, setLocalOutputType] = useState(node.data?.outputType || "");

	// 当节点数据变化时更新本地状态
	useEffect(() => {
		setLocalTriggerType(node.data?.triggerType || "");
		setLocalProcessType(node.data?.processType || "");
		setLocalOutputType(node.data?.outputType || "");
	}, [node.data]);

	// 引用下拉菜单容器
	const triggerDropdownRef = useRef<HTMLDivElement>(null);
	const processDropdownRef = useRef<HTMLDivElement>(null);
	const outputDropdownRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	// 安全地访问节点数据，避免undefined错误
	const getNodeData = useCallback(
		(key: string, defaultValue: any = "") => {
			if (!node.data) return defaultValue;
			return node.data[key] !== undefined ? node.data[key] : defaultValue;
		},
		[node.data]
	);

	// 获取当前类型的显示标签
	const getCurrentTypeLabel = (types: { value: string; label: string }[], currentValue: string) => {
		const found = types.find((t) => t.value === currentValue);
		return found ? found.label : "请选择";
	};

	// 处理点击外部关闭下拉菜单
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			// 如果点击的是面板内部但不是下拉菜单，不关闭下拉菜单
			if (panelRef.current && panelRef.current.contains(event.target as HTMLElement)) {
				// 检查是否点击了下拉菜单之外的区域
				if (
					showTriggerDropdown &&
					triggerDropdownRef.current &&
					!triggerDropdownRef.current.contains(event.target as HTMLElement)
				) {
					// 添加延迟，避免菜单过快消失
					setTimeout(() => setShowTriggerDropdown(false), 100);
				}

				if (
					showProcessDropdown &&
					processDropdownRef.current &&
					!processDropdownRef.current.contains(event.target as HTMLElement)
				) {
					setTimeout(() => setShowProcessDropdown(false), 100);
				}

				if (
					showOutputDropdown &&
					outputDropdownRef.current &&
					!outputDropdownRef.current.contains(event.target as HTMLElement)
				) {
					setTimeout(() => setShowOutputDropdown(false), 100);
				}
			} else {
				// 点击面板外部，关闭所有下拉菜单
				setShowTriggerDropdown(false);
				setShowProcessDropdown(false);
				setShowOutputDropdown(false);
			}
		}

		// 添加事件监听器
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showTriggerDropdown, showProcessDropdown, showOutputDropdown]);

	// 根据处理类型获取默认参数
	const getDefaultParametersByType = useCallback((type: string) => {
		switch (type) {
			case "ai-completion":
				return JSON.stringify(
					{
						model: "gpt-3.5-turbo",
						temperature: 0.7,
						maxTokens: 500,
						systemPrompt: "你是一个有用的AI助手。",
					},
					null,
					2
				);
			case "api-call":
				return JSON.stringify(
					{
						endpoint: "https://api.example.com/data",
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					},
					null,
					2
				);
			case "transform":
				return JSON.stringify(
					{
						transformType: "filter",
						condition: "item.value > 10",
					},
					null,
					2
				);
			case "data-filtering":
				return JSON.stringify(
					{
						filterType: "exclude",
						condition: "item.status === 'inactive'",
					},
					null,
					2
				);
			default:
				return "{}";
		}
	}, []);

	// 处理触发器类型变更
	const handleTriggerTypeChange = useCallback(
		(type: string) => {
			// 立即更新本地状态以反映UI变化
			setLocalTriggerType(type);
			// 更新节点数据
			updateNode({ triggerType: type });
			// 关闭下拉菜单
			setShowTriggerDropdown(false);
		},
		[updateNode]
	);

	// 处理处理类型变更
	const handleProcessTypeChange = useCallback(
		(type: string) => {
			// 立即更新本地状态以反映UI变化
			setLocalProcessType(type);
			// 更新节点数据
			updateNode({ processType: type });

			// 设置默认参数
			const defaultParams = getDefaultParametersByType(type);
			updateNode({ parameters: defaultParams });

			// 关闭下拉菜单
			setShowProcessDropdown(false);
		},
		[updateNode, getDefaultParametersByType]
	);

	// 处理输出类型变更
	const handleOutputTypeChange = useCallback(
		(type: string) => {
			// 立即更新本地状态以反映UI变化
			setLocalOutputType(type);
			// 更新节点数据
			updateNode({ outputType: type });
			// 关闭下拉菜单
			setShowOutputDropdown(false);
		},
		[updateNode]
	);

	return (
		<div className="space-y-4" ref={panelRef}>
			<div className="flex justify-between items-center mb-3">
				<h3 className="text-sm font-medium">节点状态</h3>
				<NodeStatusIndicator node={node} />
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">名称</label>
				<input
					type="text"
					className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
					value={getNodeData("label", "")}
					onChange={(e) => updateNode({ label: e.target.value })}
					placeholder="输入节点名称"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">描述</label>
				<textarea
					className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
					value={getNodeData("description", "")}
					onChange={(e) => updateNode({ description: e.target.value })}
					rows={2}
					placeholder="节点功能描述"
				/>
			</div>

			{nodeType === "trigger" && (
				<div className="relative" ref={triggerDropdownRef}>
					<label className="block text-sm font-medium mb-1">触发器类型</label>
					<div
						className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 flex justify-between items-center cursor-pointer"
						onClick={() => setShowTriggerDropdown(!showTriggerDropdown)}
					>
						<span>
							{getCurrentTypeLabel(
								triggerTypes,
								localTriggerType || getNodeData("triggerType", "")
							)}
						</span>
						<svg
							className="w-4 h-4 fill-current"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
						</svg>
					</div>

					{showTriggerDropdown && (
						<div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
							{triggerTypes.map((type) => (
								<div
									key={type.value}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
									onClick={() => handleTriggerTypeChange(type.value)}
								>
									{type.label}
								</div>
							))}
						</div>
					)}

					{(localTriggerType || getNodeData("triggerType")) === "schedule" && (
						<div className="mt-2">
							<label className="block text-xs font-medium mb-1">定时表达式 (Cron)</label>
							<input
								type="text"
								className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
								value={getNodeData("cronExpression", "0 0 * * *")}
								onChange={(e) => updateNode({ cronExpression: e.target.value })}
								placeholder="0 0 * * *"
							/>
							<div className="text-xs text-gray-500 mt-1">例如: 0 0 * * * (每天午夜执行)</div>
						</div>
					)}

					{(localTriggerType || getNodeData("triggerType")) === "webhook" && (
						<div className="mt-2">
							<label className="block text-xs font-medium mb-1">Webhook 路径</label>
							<input
								type="text"
								className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
								value={getNodeData("webhookPath", "/webhook")}
								onChange={(e) => updateNode({ webhookPath: e.target.value })}
								placeholder="/webhook"
							/>
						</div>
					)}
				</div>
			)}

			{nodeType === "process" && (
				<div className="relative" ref={processDropdownRef}>
					<label className="block text-sm font-medium mb-1">处理类型</label>
					<div
						className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 flex justify-between items-center cursor-pointer"
						onClick={() => setShowProcessDropdown(!showProcessDropdown)}
					>
						<span>
							{getCurrentTypeLabel(
								processTypes,
								localProcessType || getNodeData("processType", "")
							)}
						</span>
						<svg
							className="w-4 h-4 fill-current"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
						</svg>
					</div>

					{showProcessDropdown && (
						<div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
							{processTypes.map((type) => (
								<div
									key={type.value}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
									onClick={() => handleProcessTypeChange(type.value)}
								>
									{type.label}
								</div>
							))}
						</div>
					)}

					{(localProcessType || getNodeData("processType")) === "ai-completion" && (
						<div className="mt-2">
							<label className="block text-xs font-medium mb-1">AI模型</label>
							<select
								className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
								value={getNodeData("aiModel", "gpt-3.5-turbo")}
								onChange={(e) => {
									updateNode({ aiModel: e.target.value });
									// 更新参数中的模型
									try {
										const params = JSON.parse(getNodeData("parameters", "{}"));
										params.model = e.target.value;
										updateNode({ parameters: JSON.stringify(params, null, 2) });
									} catch (e) {
										// 如果参数解析失败，不更新
									}
								}}
							>
								<option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
								<option value="gpt-4">GPT-4</option>
								<option value="claude-3-opus">Claude 3 Opus</option>
								<option value="claude-3-sonnet">Claude 3 Sonnet</option>
							</select>
						</div>
					)}
				</div>
			)}

			{nodeType === "condition" && (
				<div>
					<label className="block text-sm font-medium mb-1">条件表达式</label>
					<input
						type="text"
						className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
						value={getNodeData("condition", "")}
						onChange={(e) => updateNode({ condition: e.target.value })}
						placeholder="例如: data.score > 90"
					/>
					<div className="flex justify-between text-xs mt-1">
						<div>
							<label className="block text-xs font-medium mb-1">真值标签</label>
							<input
								type="text"
								className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
								value={getNodeData("trueLabel", "是")}
								onChange={(e) => updateNode({ trueLabel: e.target.value })}
								placeholder="是"
							/>
						</div>
						<div>
							<label className="block text-xs font-medium mb-1">假值标签</label>
							<input
								type="text"
								className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
								value={getNodeData("falseLabel", "否")}
								onChange={(e) => updateNode({ falseLabel: e.target.value })}
								placeholder="否"
							/>
						</div>
					</div>
				</div>
			)}

			{nodeType === "output" && (
				<div className="relative" ref={outputDropdownRef}>
					<label className="block text-sm font-medium mb-1">输出类型</label>
					<div
						className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 flex justify-between items-center cursor-pointer"
						onClick={() => setShowOutputDropdown(!showOutputDropdown)}
					>
						<span>
							{getCurrentTypeLabel(outputTypes, localOutputType || getNodeData("outputType", ""))}
						</span>
						<svg
							className="w-4 h-4 fill-current"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
						</svg>
					</div>

					{showOutputDropdown && (
						<div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
							{outputTypes.map((type) => (
								<div
									key={type.value}
									className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
									onClick={() => handleOutputTypeChange(type.value)}
								>
									{type.label}
								</div>
							))}
						</div>
					)}

					{(localOutputType || getNodeData("outputType")) === "file" && (
						<div className="mt-2">
							<label className="block text-xs font-medium mb-1">文件路径</label>
							<input
								type="text"
								className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
								value={getNodeData("filePath", "")}
								onChange={(e) => updateNode({ filePath: e.target.value })}
								placeholder="/path/to/output.txt"
							/>
						</div>
					)}
				</div>
			)}

			<div>
				<label className="block text-sm font-medium mb-1">高级参数 (JSON格式)</label>
				<textarea
					className="w-full p-2 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600"
					value={getNodeData("parameters", "{}")}
					onChange={(e) => updateNode({ parameters: e.target.value })}
					rows={5}
					placeholder="{}"
				/>

				<div className="mt-2">
					<button
						className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
						onClick={() => {
							try {
								// 简单的参数验证
								JSON.parse(getNodeData("parameters", "{}"));
								alert("参数格式有效");
							} catch (e) {
								alert("参数格式无效: " + (e instanceof Error ? e.message : String(e)));
							}
						}}
					>
						验证参数
					</button>
				</div>
			</div>

			<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
				<h3 className="text-sm font-medium mb-3">节点样式</h3>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="block text-xs font-medium mb-1">背景颜色</label>
						<input
							type="color"
							className="w-full p-1 border rounded"
							value={getNodeData("backgroundColor", "#ffffff")}
							onChange={(e) => updateNode({ backgroundColor: e.target.value })}
						/>
					</div>
					<div>
						<label className="block text-xs font-medium mb-1">边框颜色</label>
						<input
							type="color"
							className="w-full p-1 border rounded"
							value={getNodeData("borderColor", "#cccccc")}
							onChange={(e) => updateNode({ borderColor: e.target.value })}
						/>
					</div>
				</div>
			</div>

			<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
				<h3 className="text-sm font-medium mb-3">节点操作</h3>
				<div className="flex space-x-2">
					<button
						className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
						onClick={() => {
							if (window.confirm("确定要删除此节点吗？")) {
								// 这里需要传递一个删除节点的回调函数
								onDeleteNode && onDeleteNode(node.id);
							}
						}}
					>
						删除节点
					</button>
				</div>
			</div>
		</div>
	);
}
