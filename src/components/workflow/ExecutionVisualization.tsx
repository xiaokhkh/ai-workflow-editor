"use client";

import { Edge, Node } from "reactflow";
import { useCallback, useEffect, useRef, useState } from "react";

interface ExecutionVisualizationProps {
	nodes: Node[];
	edges: Edge[];
	isRunning: boolean;
	setActiveNodeId: (id: string | null) => void;
	stopExecution: () => void;
}

interface ExecutionData {
	input?: any;
	output?: any;
	status: "pending" | "running" | "completed" | "error";
	startTime?: number;
	endTime?: number;
	error?: string;
}

export default function ExecutionVisualization({
	nodes,
	edges,
	isRunning,
	setActiveNodeId,
	stopExecution,
}: ExecutionVisualizationProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [executionPath, setExecutionPath] = useState<string[]>([]);
	const [executionData, setExecutionData] = useState<Record<string, ExecutionData>>({});
	const [flowProgress, setFlowProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [showDetails, setShowDetails] = useState(false);
	const [executionComplete, setExecutionComplete] = useState(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
	const [executionMode, setExecutionMode] = useState<"auto" | "manual">("auto");
	const [isExecuting, setIsExecuting] = useState(false);
	const animationRef = useRef<number | null>(null);
	const executionStartTime = useRef<number>(Date.now());
	const executionEndTime = useRef<number | null>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	// 模拟生成执行路径
	const generateExecutionPath = useCallback(() => {
		// 找到所有触发器节点作为起点
		const triggerNodes = nodes.filter((node) => node.type === "trigger");
		if (triggerNodes.length === 0) {
			setError("未找到触发器节点，无法开始执行");
			stopExecution();
			return [];
		}

		// 使用DFS算法生成可能的执行路径
		const startNode = triggerNodes[0];
		const path: string[] = [startNode.id];
		const visited = new Set<string>([startNode.id]);
		const nodeMap: Record<string, Node> = {};

		// 创建节点ID到节点的映射
		nodes.forEach((node) => {
			nodeMap[node.id] = node;
		});

		// 递归遍历生成路径
		const traverseGraph = (currentNodeId: string, currentPath: string[]) => {
			// 查找从当前节点出发的所有边
			const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);

			if (outgoingEdges.length === 0) {
				// 终点节点，路径完成
				return [...currentPath];
			}

			// 条件节点随机选择一个分支（实际中应该根据条件评估）
			if (nodeMap[currentNodeId]?.type === "condition") {
				const randomEdge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];
				if (randomEdge && !visited.has(randomEdge.target)) {
					visited.add(randomEdge.target);
					return traverseGraph(randomEdge.target, [...currentPath, randomEdge.target]);
				}
			}
			// 其他节点按顺序遍历所有出边
			else {
				for (const edge of outgoingEdges) {
					if (!visited.has(edge.target)) {
						visited.add(edge.target);
						return traverseGraph(edge.target, [...currentPath, edge.target]);
					}
				}
			}

			// 如果没有找到下一个节点，返回当前路径
			return [...currentPath];
		};

		return traverseGraph(startNode.id, path);
	}, [nodes, edges, stopExecution]);

	// 初始化执行数据
	const initializeExecutionData = useCallback((path: string[]) => {
		const data: Record<string, ExecutionData> = {};
		path.forEach((nodeId) => {
			data[nodeId] = {
				status: "pending",
			};
		});
		return data;
	}, []);

	// 模拟节点执行
	const simulateNodeExecution = useCallback(
		(nodeId: string, input: any = {}) => {
			return new Promise<any>((resolve) => {
				// 更新节点状态为运行中
				setExecutionData((prev) => ({
					...prev,
					[nodeId]: {
						...prev[nodeId],
						status: "running",
						input,
						startTime: Date.now(),
					},
				}));

				// 设置当前活动节点
				setActiveNodeId(nodeId);
				setSelectedNodeId(nodeId);
				setCurrentStep(executionPath.indexOf(nodeId));

				// 模拟处理时间
				const processingTime = Math.random() * 2000 + 1000; // 1-3秒
				setTimeout(() => {
					// 生成模拟输出
					const output = {
						result: `处理结果 - ${nodeId}`,
						timestamp: new Date().toISOString(),
						processingTime,
					};

					// 更新节点状态为完成
					setExecutionData((prev) => ({
						...prev,
						[nodeId]: {
							...prev[nodeId],
							status: "completed",
							output,
							endTime: Date.now(),
						},
					}));

					// 返回输出
					resolve(output);
				}, processingTime);
			});
		},
		[executionPath, setActiveNodeId]
	);

	// 获取节点执行时间
	const getNodeExecutionTime = useCallback(
		(nodeId: string) => {
			const nodeData = executionData[nodeId];
			if (!nodeData || !nodeData.startTime) return "等待中";
			if (nodeData.status === "running") {
				return `${((Date.now() - nodeData.startTime) / 1000).toFixed(1)}秒...`;
			}
			if (nodeData.endTime) {
				return `${((nodeData.endTime - nodeData.startTime) / 1000).toFixed(1)}秒`;
			}
			return "等待中";
		},
		[executionData]
	);

	// 获取节点状态样式
	const getNodeStatusStyle = useCallback(
		(nodeId: string) => {
			const status = executionData[nodeId]?.status;
			switch (status) {
				case "running":
					return "bg-blue-500 animate-pulse";
				case "completed":
					return "bg-green-500";
				case "error":
					return "bg-red-500";
				default:
					return "bg-gray-300 dark:bg-gray-600";
			}
		},
		[executionData]
	);

	// 执行单个步骤
	const executeStep = useCallback(
		async (stepIndex: number, prevOutput: any = {}) => {
			if (stepIndex >= executionPath.length) {
				// 执行完成
				setExecutionComplete(true);
				executionEndTime.current = Date.now();
				setIsExecuting(false);
				return;
			}

			setIsExecuting(true);
			const nodeId = executionPath[stepIndex];

			// 执行当前节点
			try {
				const output = await simulateNodeExecution(nodeId, prevOutput);

				// 更新进度
				const progress = ((stepIndex + 1) / executionPath.length) * 100;
				setFlowProgress(progress);

				// 如果是自动模式，继续执行下一步
				if (executionMode === "auto") {
					executeStep(stepIndex + 1, output);
				} else {
					// 手动模式，等待用户点击"下一步"
					setIsExecuting(false);
					if (stepIndex === executionPath.length - 1) {
						// 最后一步
						setExecutionComplete(true);
						executionEndTime.current = Date.now();
					}
				}

				return output;
			} catch (err) {
				console.error("执行节点出错:", err);
				setError(`执行节点 ${nodeId} 时出错`);
				setIsExecuting(false);
				return null;
			}
		},
		[executionPath, simulateNodeExecution, executionMode]
	);

	// 初始化执行
	useEffect(() => {
		if (isRunning && executionPath.length === 0) {
			// 重置状态
			setCurrentStep(0);
			setFlowProgress(0);
			setError(null);
			setExecutionComplete(false);
			setIsExecuting(false);
			executionStartTime.current = Date.now();
			executionEndTime.current = null;

			// 生成执行路径
			const path = generateExecutionPath();
			if (path.length === 0) return;

			setExecutionPath(path);

			// 初始化执行数据
			const initialData = initializeExecutionData(path);
			setExecutionData(initialData);

			// 开始执行
			executeStep(0);
		}
	}, [
		isRunning,
		generateExecutionPath,
		initializeExecutionData,
		executeStep,
		executionPath.length,
	]);

	// 上一步
	const goToPreviousStep = useCallback(() => {
		if (currentStep > 0) {
			const prevStep = currentStep - 1;
			setCurrentStep(prevStep);
			const nodeId = executionPath[prevStep];
			setSelectedNodeId(nodeId);
			setActiveNodeId(nodeId);
		}
	}, [currentStep, executionPath, setActiveNodeId]);

	// 下一步
	const goToNextStep = useCallback(() => {
		if (currentStep < executionPath.length - 1 && !isExecuting) {
			// 如果是手动模式，执行下一步
			if (executionMode === "manual") {
				const nextStep = currentStep + 1;
				const currentNodeId = executionPath[currentStep];
				const lastOutput = executionData[currentNodeId]?.output || {};
				executeStep(nextStep, lastOutput);
			}
		}
	}, [currentStep, executionPath, isExecuting, executionMode, executeStep, executionData]);

	// 切换执行模式
	const toggleExecutionMode = useCallback(
		(mode: "auto" | "manual") => {
			setExecutionMode(mode);
			// 如果切换到自动模式，且当前不在执行中，且未完成，则继续执行
			if (
				mode === "auto" &&
				!isExecuting &&
				!executionComplete &&
				currentStep < executionPath.length - 1
			) {
				const currentNodeId = executionPath[currentStep];
				const lastOutput = executionData[currentNodeId]?.output || {};
				executeStep(currentStep + 1, lastOutput);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			executionMode,
			isExecuting,
			executionComplete,
			currentStep,
			executionData,
			executionPath,
			executeStep,
		]
	);

	// 处理节点点击
	const handleNodeClick = useCallback(
		(nodeId: string) => {
			setSelectedNodeId(nodeId);
			setActiveNodeId(nodeId);
		},
		[setActiveNodeId]
	);

	// 获取总执行时间
	const getTotalExecutionTime = useCallback(() => {
		const endTime = executionEndTime.current || Date.now();
		return `${((endTime - executionStartTime.current) / 1000).toFixed(1)}秒`;
	}, []);

	return (
		<div className="h-full flex flex-col">
			<div className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-2">
				<div className="flex justify-between items-center mb-2">
					<h3 className="font-medium">{executionComplete ? "执行完成" : "正在执行工作流..."}</h3>
					<div className="flex space-x-2">
						{executionComplete && (
							<button
								className="px-3 py-1 bg-blue-500 text-white rounded"
								onClick={() => window.location.reload()}
							>
								重新运行
							</button>
						)}
						<button className="px-3 py-1 bg-red-500 text-white rounded" onClick={stopExecution}>
							关闭
						</button>
					</div>
				</div>

				{/* 执行模式切换 */}
				<div className="flex items-center mb-2 text-sm">
					<span className="mr-2">执行模式:</span>
					<button
						className={`px-2 py-0.5 rounded mr-1 ${
							executionMode === "auto"
								? "bg-blue-500 text-white"
								: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
						}`}
						onClick={() => toggleExecutionMode("auto")}
						disabled={isExecuting}
					>
						自动
					</button>
					<button
						className={`px-2 py-0.5 rounded ${
							executionMode === "manual"
								? "bg-blue-500 text-white"
								: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
						}`}
						onClick={() => toggleExecutionMode("manual")}
						disabled={isExecuting}
					>
						手动
					</button>
					<span className="text-xs ml-auto">总时间: {getTotalExecutionTime()}</span>
				</div>

				{/* 进度条 */}
				{!error && (
					<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
						<div
							className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
							style={{ width: `${flowProgress}%` }}
						></div>
					</div>
				)}
			</div>

			<div className="flex-1 overflow-y-auto" ref={contentRef}>
				{error ? (
					<div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded mt-2">
						{error}
					</div>
				) : (
					<div>
						{/* 执行路径可视化 */}
						<div className="mt-2">
							<div className="flex justify-between items-center mb-2">
								<h4 className="font-medium text-sm">执行路径</h4>
								<button
									className="text-xs text-blue-500 hover:underline"
									onClick={() => setShowDetails(!showDetails)}
								>
									{showDetails ? "隐藏详情" : "显示详情"}
								</button>
							</div>
							<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
								<div className="flex flex-wrap gap-2">
									{executionPath.map((nodeId, idx) => {
										const node = nodes.find((n) => n.id === nodeId);
										return (
											<div
												key={nodeId}
												className={`flex items-center cursor-pointer p-1 rounded ${
													currentStep === idx
														? "bg-blue-100 dark:bg-blue-900"
														: "hover:bg-gray-100 dark:hover:bg-gray-600"
												}`}
												onClick={() => handleNodeClick(nodeId)}
											>
												<div
													className={`w-3 h-3 rounded-full mr-1 ${getNodeStatusStyle(nodeId)}`}
												></div>
												<div className="hover:underline">
													{node?.data?.label || `节点${idx + 1}`}
												</div>
												{idx < executionPath.length - 1 && (
													<svg
														className="w-4 h-4 text-gray-400"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 5l7 7-7 7"
														/>
													</svg>
												)}
											</div>
										);
									})}
								</div>
							</div>

							{/* 步骤导航 */}
							{executionPath.length > 0 && (
								<div className="flex justify-between items-center my-4">
									<button
										className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
										onClick={goToPreviousStep}
										disabled={currentStep === 0 || isExecuting}
									>
										上一步
									</button>
									<span className="text-sm">
										步骤 {currentStep + 1} / {executionPath.length}
									</span>
									<button
										className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
										onClick={goToNextStep}
										disabled={
											currentStep === executionPath.length - 1 ||
											isExecuting ||
											executionMode === "auto"
										}
									>
										下一步
									</button>
								</div>
							)}

							{/* 当前节点详情 */}
							{selectedNodeId && executionData[selectedNodeId] && (
								<div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
									<div className="font-medium mb-1">
										{nodes.find((n) => n.id === selectedNodeId)?.data?.label || selectedNodeId}
									</div>
									<div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
										执行时间: {getNodeExecutionTime(selectedNodeId)}
									</div>
									{executionData[selectedNodeId].input && (
										<div className="mb-2">
											<div className="text-xs font-medium">输入:</div>
											<pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
												{JSON.stringify(executionData[selectedNodeId].input, null, 2)}
											</pre>
										</div>
									)}
									{executionData[selectedNodeId].output && (
										<div className="mt-2">
											<div className="text-xs font-medium">输出:</div>
											<pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
												{JSON.stringify(executionData[selectedNodeId].output, null, 2)}
											</pre>
										</div>
									)}
								</div>
							)}

							{/* 详细执行信息 */}
							{showDetails && (
								<div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
									<h4 className="font-medium mb-2">执行详情</h4>
									<div className="space-y-3">
										{executionPath.map((nodeId) => {
											const node = nodes.find((n) => n.id === nodeId);
											return (
												<div key={nodeId} className="p-3 border rounded dark:border-gray-700">
													<div className="flex justify-between items-center">
														<div className="font-medium">{node?.data?.label || nodeId}</div>
														<div
															className={`px-2 py-0.5 text-xs rounded-full ${
																executionData[nodeId]?.status === "running"
																	? "bg-blue-100 text-blue-800"
																	: executionData[nodeId]?.status === "completed"
																	? "bg-green-100 text-green-800"
																	: "bg-gray-100 text-gray-800"
															}`}
														>
															{executionData[nodeId]?.status === "running"
																? "执行中"
																: executionData[nodeId]?.status === "completed"
																? "已完成"
																: "等待中"}
														</div>
													</div>
													<div className="text-xs text-gray-500 mt-1">
														执行时间: {getNodeExecutionTime(nodeId)}
													</div>
													{executionData[nodeId]?.input && (
														<div className="mt-2">
															<div className="text-xs font-medium">输入:</div>
															<pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
																{JSON.stringify(executionData[nodeId].input, null, 2)}
															</pre>
														</div>
													)}
													{executionData[nodeId]?.output && (
														<div className="mt-2">
															<div className="text-xs font-medium">输出:</div>
															<pre className="text-xs mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
																{JSON.stringify(executionData[nodeId].output, null, 2)}
															</pre>
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
