"use client";

import { Handle, NodeProps, Position } from "reactflow";

import { memo } from "react";

const ConditionNode = memo(({ data, isConnectable }: NodeProps) => {
	return (
		<div
			className="px-4 py-2 shadow-md rounded-md border-2"
			style={{
				backgroundColor: data.bgColor || "#fffbe6",
				borderColor: data.borderColor || "#faad14",
			}}
		>
			<Handle type="target" position={Position.Top} isConnectable={isConnectable} />
			<div className="flex flex-col">
				<div className="font-bold text-sm">{data.label}</div>
				<div className="text-xs text-gray-600">{data.description}</div>
				{data.condition && (
					<div className="mt-1 text-xs font-mono bg-yellow-50 dark:bg-yellow-900/50 p-1 rounded">
						{data.condition}
					</div>
				)}
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				id="true"
				style={{ left: "30%" }}
				isConnectable={isConnectable}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="false"
				style={{ left: "70%" }}
				isConnectable={isConnectable}
			/>
			<div className="flex justify-between text-xs mt-1">
				<div className="ml-2">{data.trueLabel || "是"}</div>
				<div className="mr-2">{data.falseLabel || "否"}</div>
			</div>
		</div>
	);
});

ConditionNode.displayName = "ConditionNode";

export default ConditionNode;
