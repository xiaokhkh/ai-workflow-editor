"use client";

import { Handle, NodeProps, Position } from "reactflow";

import { memo } from "react";

const OutputNode = memo(({ data, isConnectable }: NodeProps) => {
	return (
		<div
			className="px-4 py-2 shadow-md rounded-md border-2"
			style={{
				backgroundColor: data.bgColor || "#f6ffed",
				borderColor: data.borderColor || "#52c41a",
			}}
		>
			<Handle type="target" position={Position.Top} isConnectable={isConnectable} />
			<div className="flex flex-col">
				<div className="font-bold text-sm">{data.label}</div>
				<div className="text-xs text-gray-600">{data.description}</div>
				{data.outputFormat && (
					<div className="mt-1 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 rounded-full inline-block">
						{getOutputFormatLabel(data.outputFormat)}
					</div>
				)}
			</div>
			<Handle
				type="source"
				position={Position.Bottom}
				isConnectable={isConnectable}
				style={{ visibility: "hidden" }} // 输出节点通常没有输出
			/>
		</div>
	);
});

function getOutputFormatLabel(type: string) {
	switch (type) {
		case "text":
			return "文本";
		case "json":
			return "JSON";
		case "html":
			return "HTML";
		case "markdown":
			return "Markdown";
		default:
			return type;
	}
}

OutputNode.displayName = "OutputNode";

export default OutputNode;
