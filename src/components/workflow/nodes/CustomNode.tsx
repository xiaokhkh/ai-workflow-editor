"use client";

import { Handle, NodeProps, Position } from "reactflow";

import { memo } from "react";

const CustomNode = memo(({ data, isConnectable }: NodeProps) => {
	return (
		<div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600">
			<Handle type="target" position={Position.Top} isConnectable={isConnectable} />
			<div className="flex flex-col">
				<div className="font-bold text-sm">{data.label}</div>
				<div className="text-xs text-gray-500 dark:text-gray-400">{data.description}</div>
			</div>
			<Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
		</div>
	);
});

CustomNode.displayName = "CustomNode";

export default CustomNode;
