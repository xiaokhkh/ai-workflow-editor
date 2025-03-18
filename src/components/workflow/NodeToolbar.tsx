"use client";

import { Node, useReactFlow } from "reactflow";

import { nanoid } from "nanoid";
import { nodeTypes } from "@/aisettings";
import { useCallback } from "react";

interface NodeToolbarProps {}

export default function NodeToolbar({}: NodeToolbarProps) {
	const reactFlowInstance = useReactFlow();

	const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData("application/reactflow", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();

			const reactFlowBounds = event.currentTarget.getBoundingClientRect();
			const type = event.dataTransfer.getData("application/reactflow");

			// 检查是否有效的节点类型
			if (!type) return;

			const position = reactFlowInstance.project({
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			});

			// 创建新节点
			const newNode = {
				id: nanoid(),
				type,
				position,
				data: {
					label: getDefaultLabelForType(type),
					description: getDefaultDescriptionForType(type),
				},
			};

			reactFlowInstance.addNodes(newNode);
		},
		[reactFlowInstance]
	);

	const getDefaultLabelForType = (type: string) => {
		switch (type) {
			case nodeTypes.TRIGGER:
				return "触发器";
			case nodeTypes.PROCESS:
				return "处理节点";
			case nodeTypes.CONDITION:
				return "条件判断";
			case nodeTypes.OUTPUT:
				return "输出节点";
			case nodeTypes.CUSTOM:
				return "自定义节点";
			default:
				return "新节点";
		}
	};

	const getDefaultDescriptionForType = (type: string) => {
		switch (type) {
			case nodeTypes.TRIGGER:
				return "工作流的起点";
			case nodeTypes.PROCESS:
				return "处理数据或执行操作";
			case nodeTypes.CONDITION:
				return "根据条件选择路径";
			case nodeTypes.OUTPUT:
				return "输出结果或执行最终操作";
			case nodeTypes.CUSTOM:
				return "自定义功能节点";
			default:
				return "描述";
		}
	};

	return (
		<div className="space-y-3">
			<div
				className="p-3 border border-blue-300 rounded bg-blue-50 dark:bg-blue-900 dark:border-blue-700 cursor-move flex items-center"
				draggable
				onDragStart={(e) => onDragStart(e, "trigger")}
			>
				<div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
				<span>触发器节点</span>
			</div>

			<div
				className="p-3 border border-indigo-300 rounded bg-indigo-50 dark:bg-indigo-900 dark:border-indigo-700 cursor-move flex items-center"
				draggable
				onDragStart={(e) => onDragStart(e, "process")}
			>
				<div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
				<span>处理节点</span>
			</div>

			<div
				className="p-3 border border-yellow-300 rounded bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700 cursor-move flex items-center"
				draggable
				onDragStart={(e) => onDragStart(e, "condition")}
			>
				<div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
				<span>条件节点</span>
			</div>

			<div
				className="p-3 border border-green-300 rounded bg-green-50 dark:bg-green-900 dark:border-green-700 cursor-move flex items-center"
				draggable
				onDragStart={(e) => onDragStart(e, "output")}
			>
				<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
				<span>输出节点</span>
			</div>

			<div
				className="p-3 border border-purple-300 rounded bg-purple-50 dark:bg-purple-900 dark:border-purple-700 cursor-move flex items-center"
				draggable
				onDragStart={(e) => onDragStart(e, "custom")}
			>
				<div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
				<span>自定义节点</span>
			</div>

			<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
				<h3 className="text-sm font-medium mb-3">操作说明</h3>
				<ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
					<li>拖拽节点到画布</li>
					<li>连接节点创建工作流</li>
					<li>点击节点或连线进行配置</li>
				</ul>
			</div>
		</div>
	);
}
