"use client";

import "reactflow/dist/style.css";

import ReactFlow, {
	Background,
	Connection,
	Controls,
	Edge,
	EdgeChange,
	MarkerType,
	MiniMap,
	Node,
	NodeChange,
	Panel,
	ReactFlowInstance,
	ReactFlowProvider,
	addEdge,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "reactflow";
import { toPng, toSvg } from "html-to-image";
import { useCallback, useEffect, useRef, useState } from "react";

import ConditionNode from "@/components/workflow/nodes/ConditionNode";
import ContextMenu from "@/components/workflow/ContextMenu";
import CustomNode from "@/components/workflow/nodes/CustomNode";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ExecutionVisualization from "@/components/workflow/ExecutionVisualization";
import HelpDocumentation from "@/components/workflow/HelpDocumentation";
import HistoryVersionManager from "@/components/workflow/HistoryVersionManager";
import NodeConfigPanel from "@/components/workflow/NodeConfigPanel";
import NodeToolbar from "@/components/workflow/NodeToolbar";
import OutputNode from "@/components/workflow/nodes/OutputNode";
import ProcessNode from "@/components/workflow/nodes/ProcessNode";
import TemplateLibrary from "@/components/workflow/TemplateLibrary";
import TriggerNode from "@/components/workflow/nodes/TriggerNode";
import ValidationErrors from "@/components/workflow/ValidationErrors";
import WorkflowValidation from "@/components/workflow/WorkflowValidation";
import WorkflowValidator from "@/components/workflow/WorkflowValidator";
import { editorSettings } from "@/aisettings";
import { nanoid } from "nanoid";
import { saveAs } from "file-saver";
import { useHotkeys } from "react-hotkeys-hook";

// 注册自定义节点类型
const nodeTypes = {
	custom: CustomNode,
	trigger: TriggerNode,
	process: ProcessNode,
	condition: ConditionNode,
	output: OutputNode,
};

// 初始节点
const initialNodes: Node[] = [
	{
		id: "1",
		type: "trigger",
		position: { x: 250, y: 100 },
		data: { label: "开始", description: "工作流的起点" },
	},
	{
		id: "2",
		type: "process",
		position: { x: 250, y: 250 },
		data: { label: "处理", description: "处理用户输入" },
	},
	{
		id: "3",
		type: "output",
		position: { x: 250, y: 400 },
		data: { label: "输出", description: "返回结果" },
	},
];

// 初始连线
const initialEdges: Edge[] = [
	{
		id: "e1-2",
		source: "1",
		target: "2",
		type: "bezier",
		markerEnd: { type: MarkerType.ArrowClosed },
	},
	{
		id: "e2-3",
		source: "2",
		target: "3",
		type: "bezier",
		markerEnd: { type: MarkerType.ArrowClosed },
	},
];

// 连线类型选项
const edgeTypeOptions = [
	{ value: "bezier", label: "曲线" },
	{ value: "straight", label: "直线" },
	{ value: "step", label: "折线" },
];

function WorkflowEditorContent() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
	const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
	const [edgeType, setEdgeType] = useState<string>("bezier");
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
	const [isHistoryManagerOpen, setIsHistoryManagerOpen] = useState<boolean>(false);
	const [isHelpDocOpen, setIsHelpDocOpen] = useState(false);

	// 历史记录
	const [history, setHistory] = useState<{
		past: { nodes: Node[]; edges: Edge[] }[];
		future: { nodes: Node[]; edges: Edge[] }[];
	}>({
		past: [],
		future: [],
	});
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const { project } = useReactFlow();

	// 处理连线
	const onConnect = useCallback(
		(connection: Connection) => {
			// 创建新连线时采用当前选择的连线类型
			const newEdge = {
				...connection,
				id: `e${connection.source}-${connection.target}`,
				type: edgeType,
				markerEnd: { type: MarkerType.ArrowClosed },
			};

			// 添加到历史记录
			setHistory((prev) => ({
				past: [...prev.past, { nodes, edges }],
				future: [],
			}));

			setEdges((eds) => addEdge(newEdge, eds));
		},
		[edgeType, nodes, edges, setEdges]
	);

	// 选择节点
	const onNodeClick = useCallback(
		(_: React.MouseEvent, node: Node) => {
			// 确保传递的节点是有效的
			if (node && typeof node.id === "string") {
				setSelectedNode(node);
				setSelectedEdge(null);
			}
		},
		[setSelectedNode]
	);

	// 选择连线
	const onEdgeClick = useCallback(
		(_: React.MouseEvent, edge: Edge) => {
			setSelectedEdge(edge);
			setSelectedNode(null);
		},
		[setSelectedEdge]
	);

	// 清除选择
	const onPaneClick = useCallback(() => {
		setSelectedNode(null);
		setSelectedEdge(null);
	}, [setSelectedNode, setSelectedEdge]);

	// 更新选中连线的类型
	const updateSelectedEdgeType = useCallback(
		(type: string) => {
			if (!selectedEdge) return;

			setEdges((eds) =>
				eds.map((edge) => {
					if (edge.id === selectedEdge.id) {
						return { ...edge, type };
					}
					return edge;
				})
			);
		},
		[selectedEdge, setEdges]
	);

	// 删除选中的连线
	const deleteSelectedEdge = useCallback(() => {
		if (!selectedEdge) return;

		// 添加到历史记录
		setHistory((prev) => ({
			past: [...prev.past, { nodes, edges }],
			future: [],
		}));

		setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
		setSelectedEdge(null);
	}, [selectedEdge, setEdges, nodes, edges]);

	// 保存工作流为JSON
	const saveWorkflow = useCallback(() => {
		if (!rfInstance) return;

		const flow = rfInstance.toObject();
		const jsonString = JSON.stringify(flow, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		saveAs(blob, "workflow.json");
	}, [rfInstance]);

	// 添加模拟执行函数
	const simulateExecution = useCallback(
		(startNodeId: string) => {
			// 创建节点ID到节点的映射
			const nodeMap: Record<string, Node> = {};
			nodes.forEach((node) => {
				nodeMap[node.id] = node;
			});

			// 模拟执行路径
			const executePath = (currentNodeId: string, visited = new Set<string>()) => {
				// 标记当前节点为已访问
				visited.add(currentNodeId);

				// 设置当前节点为活动节点
				setActiveNodeId(currentNodeId);

				// 模拟节点处理时间
				const processTime = Math.random() * 1000 + 500; // 500-1500ms

				// 延迟后继续执行下一个节点
				setTimeout(() => {
					// 查找从当前节点出发的所有边
					const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);

					// 如果没有出边，执行结束
					if (outgoingEdges.length === 0) {
						return;
					}

					// 条件节点随机选择一个分支
					if (nodeMap[currentNodeId]?.type === "condition") {
						const randomEdge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];
						if (randomEdge && !visited.has(randomEdge.target)) {
							executePath(randomEdge.target, visited);
						}
					}
					// 其他节点按顺序遍历所有出边
					else {
						for (const edge of outgoingEdges) {
							if (!visited.has(edge.target)) {
								executePath(edge.target, visited);
								break; // 只执行第一个未访问的目标节点
							}
						}
					}
				}, processTime);
			};

			// 开始执行
			executePath(startNodeId);
		},
		[nodes, edges, setActiveNodeId]
	);

	// 修改 validateWorkflow 函数，确保返回错误数组
	const validateWorkflow = useCallback(() => {
		const errors: string[] = [];

		// 检查是否有触发器节点
		const hasTrigger = nodes.some((node) => node.type === "trigger");
		if (!hasTrigger) {
			errors.push("工作流缺少触发器节点");
		}

		// 检查是否有输出节点
		const hasOutput = nodes.some((node) => node.type === "output");
		if (!hasOutput) {
			errors.push("工作流缺少输出节点");
		}

		// 检查孤立节点
		nodes.forEach((node) => {
			const hasIncoming = edges.some((edge) => edge.target === node.id);
			const hasOutgoing = edges.some((edge) => edge.source === node.id);

			// 触发器节点不需要入边
			if (node.type !== "trigger" && !hasIncoming) {
				errors.push(`节点 "${node.data?.label || node.id}" 没有连接到任何输入`);
			}

			// 输出节点不需要出边
			if (node.type !== "output" && !hasOutgoing) {
				errors.push(`节点 "${node.data?.label || node.id}" 没有连接到任何输出`);
			}
		});

		return errors;
	}, [nodes, edges]);

	// 运行工作流
	const runWorkflow = useCallback(() => {
		// 先验证工作流
		const errors = validateWorkflow();
		if (errors.length > 0) {
			setValidationErrors(errors);
			return;
		}

		// 验证成功后不显示提示，直接运行
		setIsRunning(true);
		setActiveNodeId(null);

		// 模拟执行过程
		const triggerNodes = nodes.filter((node) => node.type === "trigger");
		if (triggerNodes.length > 0) {
			// 从触发器节点开始执行
			const startNodeId = triggerNodes[0].id;
			setActiveNodeId(startNodeId);

			// 模拟执行路径
			simulateExecution(startNodeId);
		}
	}, [nodes, edges, validateWorkflow, setValidationErrors, simulateExecution]);

	// 停止工作流
	const stopWorkflow = useCallback(() => {
		setIsRunning(false);
		setActiveNodeId(null);
	}, []);

	// 导出为图片
	const exportAsPng = useCallback(() => {
		if (reactFlowWrapper.current === null) return;

		toPng(reactFlowWrapper.current, {
			filter: (node) => {
				// 不导出控制面板等UI元素
				return !node.classList?.contains("react-flow__panel");
			},
		}).then((dataUrl) => {
			const link = document.createElement("a");
			link.download = "workflow.png";
			link.href = dataUrl;
			link.click();
		});
	}, []);

	// 导出为SVG
	const exportAsSvg = useCallback(() => {
		if (reactFlowWrapper.current === null) return;

		toSvg(reactFlowWrapper.current, {
			filter: (node) => {
				return !node.classList?.contains("react-flow__panel");
			},
		}).then((dataUrl) => {
			const link = document.createElement("a");
			link.download = "workflow.svg";
			link.href = dataUrl;
			link.click();
		});
	}, []);

	// 撤销操作
	const undo = useCallback(() => {
		if (history.past.length === 0) return;

		const previous = history.past[history.past.length - 1];
		const newPast = history.past.slice(0, history.past.length - 1);

		setHistory({
			past: newPast,
			future: [{ nodes, edges }, ...history.future],
		});

		setNodes(previous.nodes);
		setEdges(previous.edges);
	}, [history, nodes, edges, setNodes, setEdges]);

	// 重做操作
	const redo = useCallback(() => {
		if (history.future.length === 0) return;

		const next = history.future[0];
		const newFuture = history.future.slice(1);

		setHistory({
			past: [...history.past, { nodes, edges }],
			future: newFuture,
		});

		setNodes(next.nodes);
		setEdges(next.edges);
	}, [history, nodes, edges, setNodes, setEdges]);

	// 自动布局
	const autoLayout = useCallback(() => {
		// 简单的自上而下布局
		const nodeMap = new Map();
		const levels = new Map();

		// 找出所有起始节点（没有入边的节点）
		const startNodes = nodes.filter((node) => {
			return !edges.some((edge) => edge.target === node.id);
		});

		// 广度优先遍历，计算每个节点的层级
		const queue = [...startNodes.map((node) => ({ node, level: 0 }))];
		while (queue.length > 0) {
			const { node, level } = queue.shift()!;
			if (!nodeMap.has(node.id)) {
				nodeMap.set(node.id, node);
				levels.set(node.id, level);

				// 找出所有从当前节点出发的边
				const outEdges = edges.filter((edge) => edge.source === node.id);
				for (const edge of outEdges) {
					const targetNode = nodes.find((n) => n.id === edge.target);
					if (targetNode) {
						queue.push({ node: targetNode, level: level + 1 });
					}
				}
			}
		}

		// 根据层级重新计算节点位置
		const levelCounts = new Map();
		const spacing = { x: 250, y: 150 };

		levels.forEach((level, nodeId) => {
			levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
		});

		const levelPositions = new Map();
		levels.forEach((level, nodeId) => {
			if (!levelPositions.has(level)) {
				levelPositions.set(level, 0);
			}

			setNodes((nds) =>
				nds.map((n) => {
					if (n.id === nodeId) {
						const count = levelCounts.get(level);
						const position = levelPositions.get(level);
						const x = spacing.x * (position + 1);
						const y = spacing.y * (level + 1);
						levelPositions.set(level, position + 1);
						return {
							...n,
							position: { x, y },
						};
					}
					return n;
				})
			);
		});

		// 添加到历史记录
		setHistory((prev) => ({
			past: [...prev.past, { nodes, edges }],
			future: [],
		}));
	}, [nodes, edges, setNodes]);

	// 热键绑定
	useHotkeys("ctrl+z", undo, [undo]);
	useHotkeys("ctrl+y", redo, [redo]);
	useHotkeys("ctrl+s", (e) => {
		e.preventDefault();
		saveWorkflow();
	});

	// 处理节点样式，增加活动节点高亮
	useEffect(() => {
		if (activeNodeId) {
			setNodes((nds) =>
				nds.map((node) => {
					if (node.id === activeNodeId) {
						// 添加活动样式
						return {
							...node,
							style: {
								...node.style,
								boxShadow: "0 0 10px #ff0072",
								borderColor: "#ff0072",
								borderWidth: 2,
							},
						};
					} else {
						// 恢复默认样式
						const { boxShadow, borderColor, borderWidth, ...restStyle } = node.style || {};
						return {
							...node,
							style: restStyle,
						};
					}
				})
			);
		} else {
			// 当没有活动节点时，移除所有节点的高亮样式
			setNodes((nds) =>
				nds.map((node) => {
					const { boxShadow, borderColor, borderWidth, ...restStyle } = node.style || {};
					return {
						...node,
						style: restStyle,
					};
				})
			);
		}
	}, [activeNodeId, setNodes]);

	// 拖放处理
	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();

			const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
			if (!reactFlowBounds) return;

			const type = event.dataTransfer.getData("application/reactflow");
			if (!type) return;

			const position = project({
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			});

			// 根据节点类型设置默认数据
			let data = { label: "新节点", description: "" };
			switch (type) {
				case "trigger":
					data = { label: "触发器", description: "工作流起点" };
					break;
				case "process":
					data = { label: "处理节点", description: "处理数据" };
					break;
				case "condition":
					data = { label: "条件节点", description: "判断条件" };
					break;
				case "output":
					data = { label: "输出节点", description: "输出结果" };
					break;
			}

			const newNode = {
				id: nanoid(),
				type,
				position,
				data,
			};

			// 添加到历史记录
			setHistory((prev) => ({
				past: [...prev.past, { nodes, edges }],
				future: [],
			}));

			setNodes((nds) => nds.concat(newNode));
		},
		[project, setNodes, nodes, edges]
	);

	// 导入工作流
	const importWorkflow = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const fileReader = new FileReader();
			if (event.target.files && event.target.files.length > 0) {
				fileReader.readAsText(event.target.files[0], "UTF-8");
				fileReader.onload = (e) => {
					try {
						const content = e.target?.result as string;
						const flow = JSON.parse(content);

						if (flow.nodes && flow.edges) {
							// 添加到历史记录
							setHistory((prev) => ({
								past: [...prev.past, { nodes, edges }],
								future: [],
							}));

							setNodes(flow.nodes);
							setEdges(flow.edges);
						} else {
							alert("无效的工作流文件格式！");
						}
					} catch (error) {
						console.error("导入错误:", error);
						alert("导入失败，请检查文件格式！");
					}
				};
			}
		},
		[setNodes, setEdges, nodes, edges]
	);

	// 处理节点删除
	const onNodesDelete = useCallback(
		(deleted: Node[]) => {
			// 将删除操作添加到历史记录
			setHistory((prev) => ({
				past: [...prev.past, { nodes, edges }],
				future: [],
			}));

			// 如果选中的节点被删除，清除选中状态
			if (selectedNode && deleted.some((node) => node.id === selectedNode.id)) {
				setSelectedNode(null);
			}

			// 删除与被删除节点相关的边
			setEdges(
				edges.filter((edge) => {
					return !deleted.some((node) => node.id === edge.source || node.id === edge.target);
				})
			);
		},
		[selectedNode, nodes, edges, setEdges]
	);

	// 添加键盘事件处理函数
	const onKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			// 当按下Delete或Backspace键时删除选中的节点或边
			if (event.key === "Delete" || event.key === "Backspace") {
				if (selectedNode) {
					// 删除选中的节点
					setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
					// 同时删除与该节点相关的所有边
					setEdges((eds) =>
						eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
					);
					setSelectedNode(null);

					// 添加到历史记录
					setHistory((prev) => ({
						past: [...prev.past, { nodes, edges }],
						future: [],
					}));
				} else if (selectedEdge) {
					// 删除选中的边
					setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
					setSelectedEdge(null);

					// 添加到历史记录
					setHistory((prev) => ({
						past: [...prev.past, { nodes, edges }],
						future: [],
					}));
				}
			}
		},
		[selectedNode, selectedEdge, setNodes, setEdges, nodes, edges, setHistory]
	);

	// 在 WorkflowEditor 组件中添加删除节点的处理函数
	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			// 删除节点
			setNodes((nds) => nds.filter((n) => n.id !== nodeId));

			// 同时删除与该节点相关的所有边
			setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));

			// 如果当前选中的是被删除的节点，清除选中状态
			if (selectedNode && selectedNode.id === nodeId) {
				setSelectedNode(null);
			}

			// 添加到历史记录
			setHistory((prev) => ({
				past: [...prev.past, { nodes, edges }],
				future: [],
			}));
		},
		[nodes, edges, selectedNode, setNodes, setEdges, setSelectedNode, setHistory]
	);

	// 处理节点拖拽停止
	const onNodeDragStop = useCallback(
		(event: React.MouseEvent, node: Node) => {
			// 当节点拖拽停止时，将当前状态添加到历史记录
			setHistory((prev) => ({
				past: [...prev.past, { nodes, edges }],
				future: [],
			}));
		},
		[nodes, edges, setHistory]
	);

	// 导出工作流函数
	const exportWorkflow = useCallback(() => {
		if (!rfInstance) return;

		const flow = rfInstance.toObject();
		const jsonString = JSON.stringify(flow, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		saveAs(blob, "workflow.json");
	}, [rfInstance]);

	// 添加右键菜单处理
	const onEdgeContextMenu = useCallback(
		(event: React.MouseEvent, edge: Edge) => {
			event.preventDefault();
			setSelectedEdge(edge);
			setSelectedNode(null);

			// 显示右键菜单
			// 如果使用自定义右键菜单组件，这里需要设置菜单位置
		},
		[setSelectedEdge, setSelectedNode]
	);

	// 添加打开历史版本管理器的函数
	const openHistoryManager = useCallback(() => {
		setIsHistoryManagerOpen(true);
	}, []);

	// 添加打开帮助文档的函数
	const openHelpDoc = useCallback(() => {
		setIsHelpDocOpen(true);
	}, []);

	return (
		<div className="flex flex-col h-screen">
			<div className="flex flex-1 overflow-hidden">
				<div className="flex-1 relative" ref={reactFlowWrapper}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onNodeClick={onNodeClick}
						onEdgeClick={onEdgeClick}
						onPaneClick={onPaneClick}
						onNodeDragStop={onNodeDragStop}
						nodeTypes={nodeTypes}
						fitView
						snapToGrid
						snapGrid={[15, 15]}
						defaultViewport={{ x: 0, y: 0, zoom: 1 }}
						attributionPosition="bottom-right"
						onInit={setRfInstance}
						onDrop={onDrop}
						onDragOver={onDragOver}
						onKeyDown={onKeyDown}
						onEdgeContextMenu={onEdgeContextMenu}
					>
						<Background />
						<Controls />
						<MiniMap />
						<Panel position="top-left">
							<NodeToolbar />
						</Panel>
						<Panel position="top-center">
							<div className="flex flex-wrap gap-2 mb-2 justify-center">
								<div className="flex space-x-2">
									<TemplateLibrary
										setNodes={setNodes}
										setEdges={setEdges}
										setHistory={setHistory}
									/>
								</div>

								<div className="flex space-x-2">
									<button
										className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-24 transition-colors"
										onClick={exportWorkflow}
									>
										导出
									</button>
									<label className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded cursor-pointer w-24 text-center transition-colors">
										导入
										<input
											type="file"
											accept=".json"
											className="hidden"
											onChange={importWorkflow}
										/>
									</label>
								</div>

								<div className="flex space-x-2">
									<button
										className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded w-24 transition-colors"
										onClick={autoLayout}
									>
										自动布局
									</button>

									<button
										className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded w-24 transition-colors"
										onClick={openHistoryManager}
									>
										历史版本
									</button>
								</div>

								<div className="flex space-x-2">
									<WorkflowValidator
										nodes={nodes}
										edges={edges}
										setValidationErrors={setValidationErrors}
									/>

									{!isRunning ? (
										<button
											className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded w-24 transition-colors"
											onClick={runWorkflow}
										>
											运行
										</button>
									) : (
										<button
											className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded w-24 transition-colors"
											onClick={stopWorkflow}
										>
											停止
										</button>
									)}
								</div>

								<div className="flex space-x-2">
									<button
										className={`px-4 py-2 rounded w-24 transition-colors ${
											history.past.length === 0
												? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
												: "bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-500"
										}`}
										onClick={undo}
										disabled={history.past.length === 0}
									>
										撤销
									</button>

									<button
										className={`px-4 py-2 rounded w-24 transition-colors ${
											history.future.length === 0
												? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
												: "bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-500"
										}`}
										onClick={redo}
										disabled={history.future.length === 0}
									>
										重做
									</button>
								</div>

								<div className="flex space-x-2">
									<button
										className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded w-24 transition-colors"
										onClick={openHelpDoc}
									>
										使用帮助
									</button>
								</div>
							</div>
						</Panel>

						{validationErrors.length > 0 && (
							<ValidationErrors errors={validationErrors} onClose={() => setValidationErrors([])} />
						)}

						<ContextMenu
							selectedNode={selectedNode}
							selectedEdge={selectedEdge}
							setSelectedNode={setSelectedNode}
							setSelectedEdge={setSelectedEdge}
						/>
					</ReactFlow>
				</div>

				<div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
					{isRunning ? (
						// 执行可视化放在侧边栏
						<ExecutionVisualization
							nodes={nodes}
							edges={edges}
							isRunning={isRunning}
							setActiveNodeId={setActiveNodeId}
							stopExecution={stopWorkflow}
						/>
					) : selectedNode ? (
						// 节点配置面板
						<div>
							<h2 className="text-lg font-semibold mb-4">节点配置</h2>
							<NodeConfigPanel
								node={selectedNode}
								updateNode={(updatedData) => {
									setNodes((nds: Node[]) =>
										nds.map((n: Node) => {
											if (n.id === selectedNode.id) {
												// 确保 data 存在
												const currentData = n.data || {};
												const updatedNode = {
													...n,
													data: { ...currentData, ...updatedData },
												};
												return updatedNode;
											}
											return n;
										})
									);
								}}
								onDeleteNode={handleDeleteNode}
							/>
						</div>
					) : (
						// 没有选中节点时显示工作流信息
						<div>
							<h2 className="text-lg font-semibold mb-4">工作流信息</h2>
							<div className="text-sm text-gray-600 dark:text-gray-300">
								<p>节点数量: {nodes.length}</p>
								<p>连接数量: {edges.length}</p>
								<p className="mt-4">选择一个节点进行配置，或使用工具栏添加新节点。</p>
							</div>
						</div>
					)}
				</div>
			</div>

			<HistoryVersionManager
				isOpen={isHistoryManagerOpen}
				onClose={() => setIsHistoryManagerOpen(false)}
				nodes={nodes}
				edges={edges}
				setNodes={setNodes}
				setEdges={setEdges}
				setHistory={setHistory}
			/>

			<HelpDocumentation isOpen={isHelpDocOpen} onClose={() => setIsHelpDocOpen(false)} />
		</div>
	);
}

export default function WorkflowEditor() {
	return (
		<ReactFlowProvider>
			<ErrorBoundary>
				<WorkflowEditorContent />
			</ErrorBoundary>
		</ReactFlowProvider>
	);
}
