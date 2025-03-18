"use client";

import { Handle, NodeProps, Position } from "reactflow";

import { memo } from "react";

const TriggerNode = memo(({ data, isConnectable }: NodeProps) => {
	return (
		<div
			className="px-4 py-2 shadow-md rounded-md border-2"
			style={{
				backgroundColor: data.bgColor || "#e6f7ff",
				borderColor: data.borderColor || "#1890ff",
			}}
		>
			<Handle
				type="target"
				position={Position.Top}
				isConnectable={isConnectable}
				style={{ visibility: "hidden" }} // 触发器节点通常没有输入
			/>
			<div className="flex flex-col">
				<div className="font-bold text-sm">{data.label}</div>
				<div className="text-xs text-gray-600">{data.description}</div>
				{data.triggerType && (
					<div className="mt-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded-full inline-block">
						{getTriggerTypeLabel(data.triggerType)}
					</div>
				)}
			</div>
			<Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
		</div>
	);
});

function getTriggerTypeLabel(type: string) {
	switch (type) {
		case "manual":
			return "手动触发";
		case "scheduled":
			return "定时触发";
		case "webhook":
			return "Webhook";
		case "event":
			return "事件触发";
		default:
			return type;
	}
}

TriggerNode.displayName = "TriggerNode";

export default TriggerNode;
