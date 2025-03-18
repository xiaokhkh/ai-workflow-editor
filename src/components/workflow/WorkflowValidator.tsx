"use client";

import { Edge, Node } from "reactflow";
import { useCallback, useState } from "react";

type ValidationType = "connection" | "configuration" | "cycle" | "completeness";

interface WorkflowValidatorProps {
	nodes: Node[];
	edges: Edge[];
	setValidationErrors: (errors: string[]) => void;
}

export default function WorkflowValidator({
	nodes,
	edges,
	setValidationErrors,
}: WorkflowValidatorProps) {
	const [showSuccessToast, setShowSuccessToast] = useState(false);

	// 检查节点连接
	const validateConnections = useCallback((): string[] => {
		const errors: string[] = [];

		// 检查孤立节点
		nodes.forEach((node) => {
			const nodeHasConnections = edges.some(
				(edge) => edge.source === node.id || edge.target === node.id
			);

			if (!nodeHasConnections && node.type !== "trigger") {
				errors.push(`节点 "${node.data.label}" (ID: ${node.id}) 未连接到工作流`);
			}
		});

		// 检查触发器是否有出口连接
		nodes.forEach((node) => {
			if (node.type === "trigger") {
				const hasOutgoing = edges.some((edge) => edge.source === node.id);
				if (!hasOutgoing) {
					errors.push(`触发器节点 "${node.data.label}" 没有出口连接`);
				}
			}
		});

		// 检查输出节点是否有入口连接
		nodes.forEach((node) => {
			if (node.type === "output") {
				const hasIncoming = edges.some((edge) => edge.target === node.id);
				if (!hasIncoming) {
					errors.push(`输出节点 "${node.data.label}" 没有入口连接`);
				}
			}
		});

		return errors;
	}, [nodes, edges]);

	// 检查节点配置
	const validateConfigurations = useCallback((): string[] => {
		const errors: string[] = [];

		nodes.forEach((node) => {
			// 跳过已完全配置的节点
			if (isNodeFullyConfigured(node)) {
				return;
			}

			// 检查节点标签
			if (!node.data?.label) {
				errors.push(`节点 (ID: ${node.id}) 缺少标签`);
			}

			// 检查触发器配置
			if (node.type === "trigger" && !node.data?.triggerType) {
				errors.push(`触发器节点 "${node.data?.label || "未命名"}" 未配置触发类型`);
			}

			// 检查处理节点配置
			if (node.type === "process" && !node.data?.processType) {
				errors.push(`处理节点 "${node.data?.label || "未命名"}" 未配置处理类型`);
			}

			// 检查条件节点配置
			if (node.type === "condition" && !node.data?.condition) {
				errors.push(`条件节点 "${node.data?.label || "未命名"}" 未配置条件表达式`);
			}

			// 检查输出节点配置
			if (node.type === "output" && !node.data?.outputType) {
				errors.push(`输出节点 "${node.data?.label || "未命名"}" 未配置输出类型`);
			}

			// 检查特殊配置要求
			if (
				node.type === "process" &&
				node.data?.processType === "api-call" &&
				(!node.data?.parameters || !node.data.parameters.includes("endpoint"))
			) {
				// 仅当选择了 API 调用类型才检查
				const params = tryParseJSON(node.data?.parameters || "{}");
				if (!params || !params.endpoint) {
					errors.push(`API调用节点 "${node.data?.label || "未命名"}" 缺少endpoint参数`);
				}
			}

			if (
				node.type === "process" &&
				node.data?.processType === "ai-completion" &&
				(!node.data?.parameters || !node.data.parameters.includes("model"))
			) {
				// 仅当选择了 AI 补全类型才检查
				const params = tryParseJSON(node.data?.parameters || "{}");
				if (!params || !params.model) {
					errors.push(`AI补全节点 "${node.data?.label || "未命名"}" 缺少model参数`);
				}
			}
		});

		return errors;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nodes]);

	// 添加判断节点是否完全配置的辅助函数
	const isNodeFullyConfigured = useCallback((node: Node): boolean => {
		if (!node.data?.label) return false;

		switch (node.type) {
			case "trigger":
				return !!node.data?.triggerType;
			case "process":
				if (!node.data?.processType) return false;

				// 检查特殊类型的参数
				if (node.data.processType === "api-call") {
					const params = tryParseJSON(node.data?.parameters || "{}");
					return !!params && !!params.endpoint;
				}

				if (node.data.processType === "ai-completion") {
					const params = tryParseJSON(node.data?.parameters || "{}");
					return !!params && !!params.model;
				}

				return true;
			case "condition":
				return !!node.data?.condition;
			case "output":
				return !!node.data?.outputType;
			default:
				return true;
		}
	}, []);

	// 辅助函数：安全解析JSON
	const tryParseJSON = (jsonString: string): any => {
		try {
			return JSON.parse(jsonString);
		} catch (e) {
			return null;
		}
	};

	// 检查工作流完整性
	const validateCompleteness = useCallback((): string[] => {
		const errors: string[] = [];

		// 检查是否有至少一个触发器节点
		const hasTrigger = nodes.some((node) => node.type === "trigger");
		if (!hasTrigger) {
			errors.push("工作流缺少触发器节点");
		}

		// 检查是否有至少一个输出节点
		const hasOutput = nodes.some((node) => node.type === "output");
		if (!hasOutput) {
			errors.push("工作流缺少输出节点");
		}

		// 检查条件节点的连接
		nodes.forEach((node) => {
			if (node.type === "condition") {
				const outgoingEdges = edges.filter((edge) => edge.source === node.id);
				if (outgoingEdges.length < 2) {
					errors.push(`条件节点 "${node.data.label}" 缺少路径分支，条件节点需要至少两个出口`);
				}
			}
		});

		return errors;
	}, [nodes, edges]);

	// 检查循环依赖
	const validateCycles = useCallback((): string[] => {
		const errors: string[] = [];

		// 构建图邻接表
		const graph: Record<string, string[]> = {};
		nodes.forEach((node) => {
			graph[node.id] = [];
		});

		edges.forEach((edge) => {
			graph[edge.source].push(edge.target);
		});

		// DFS检测循环
		const visited = new Set<string>();
		const recursionStack = new Set<string>();

		const detectCycle = (nodeId: string, path: string[] = []): boolean => {
			if (recursionStack.has(nodeId)) {
				// 找到循环，构建循环路径
				const cycleStart = path.findIndex((id) => id === nodeId);
				if (cycleStart >= 0) {
					const cyclePath =
						path
							.slice(cycleStart)
							.map((id) => {
								const node = nodes.find((n) => n.id === id);
								return node ? node.data.label : id;
							})
							.join(" → ") + ` → ${nodes.find((n) => n.id === nodeId)?.data.label || nodeId}`;

					errors.push(`检测到循环依赖: ${cyclePath}`);
				}
				return true;
			}

			if (visited.has(nodeId)) {
				return false;
			}

			visited.add(nodeId);
			recursionStack.add(nodeId);

			for (const neighbor of graph[nodeId] || []) {
				if (detectCycle(neighbor, [...path, nodeId])) {
					return true;
				}
			}

			recursionStack.delete(nodeId);
			return false;
		};

		// 对所有未访问节点检测循环
		for (const nodeId of Object.keys(graph)) {
			if (!visited.has(nodeId)) {
				detectCycle(nodeId);
			}
		}

		return errors;
	}, [nodes, edges]);

	// 执行全面验证
	const validateWorkflow = useCallback(() => {
		const connectionErrors = validateConnections();
		const configErrors = validateConfigurations();
		const completenessErrors = validateCompleteness();
		const cycleErrors = validateCycles();

		const allErrors = [...connectionErrors, ...configErrors, ...completenessErrors, ...cycleErrors];

		setValidationErrors(allErrors);

		// 如果没有错误，显示成功提示
		if (allErrors.length === 0) {
			setShowSuccessToast(true);
			// 3秒后自动隐藏
			setTimeout(() => {
				setShowSuccessToast(false);
			}, 3000);
		}

		return allErrors.length === 0;
	}, [
		validateConnections,
		validateConfigurations,
		validateCompleteness,
		validateCycles,
		setValidationErrors,
	]);

	return (
		<div className="flex space-x-2 relative">
			<button
				className="px-3 py-1 bg-orange-500 text-white rounded"
				onClick={() => validateWorkflow()}
			>
				验证工作流
			</button>

			{/* 成功提示 Toast */}
			{showSuccessToast && (
				<div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-md z-50 whitespace-nowrap flex items-center animate-fade-in">
					<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clipRule="evenodd"
						/>
					</svg>
					<span>工作流验证通过！</span>
				</div>
			)}
		</div>
	);
}
