"use client";

import { Handle, NodeProps, Position } from "reactflow";

import { memo } from "react";

const ProcessNode = memo(({ data, isConnectable }: NodeProps) => {
	return (
		<div
			className="px-4 py-2 shadow-md rounded-md border-2"
			style={{
				backgroundColor: data.bgColor || "#f0f5ff",
				borderColor: data.borderColor || "#2f54eb",
			}}
		>
			<Handle type="target" position={Position.Top} isConnectable={isConnectable} />
			<div className="flex flex-col">
				<div className="font-bold text-sm">{data.label}</div>
				<div className="text-xs text-gray-600">{data.description}</div>
				{data.processType && (
					<div className="mt-1 text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 rounded-full inline-block">
						{getProcessTypeLabel(data.processType)}
					</div>
				)}
			</div>
			<Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
		</div>
	);
});

function getProcessTypeLabel(type: string) {
	switch (type) {
		case "transform":
			return "数据转换";
		case "aiCompletion":
			return "AI补全";
		case "apiCall":
			return "API调用";
		case "dataFilter":
			return "数据过滤";
		default:
			return type;
	}
}

ProcessNode.displayName = "ProcessNode";

export default ProcessNode;
