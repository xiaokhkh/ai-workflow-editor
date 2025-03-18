"use client";

import { Node } from "reactflow";
import { useCallback } from "react";

interface NodeStatusIndicatorProps {
	node: Node;
}

export default function NodeStatusIndicator({ node }: NodeStatusIndicatorProps) {
	const getNodeConfigStatus = useCallback((node: Node) => {
		// 安全获取节点数据
		const getData = (key: string) => {
			if (!node.data) return null;
			return node.data[key];
		};

		// 检查节点是否已配置
		switch (node.type) {
			case "trigger":
				return getData("triggerType") ? "已配置" : "未配置";
			case "process":
				if (!getData("processType")) return "未配置";

				if (getData("processType") === "api-call") {
					try {
						const params = JSON.parse(getData("parameters") || "{}");
						return params.endpoint ? "已配置" : "参数缺失";
					} catch {
						return "参数无效";
					}
				}

				if (getData("processType") === "ai-completion") {
					try {
						const params = JSON.parse(getData("parameters") || "{}");
						return params.model ? "已配置" : "参数缺失";
					} catch {
						return "参数无效";
					}
				}

				return "已配置";
			case "condition":
				return getData("condition") ? "已配置" : "未配置";
			case "output":
				return getData("outputType") ? "已配置" : "未配置";
			default:
				return "未知";
		}
	}, []);

	const status = getNodeConfigStatus(node);

	// 根据状态返回不同的样式
	const getStatusStyle = () => {
		switch (status) {
			case "已配置":
				return "bg-green-500";
			case "未配置":
				return "bg-yellow-500";
			case "参数缺失":
			case "参数无效":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<div className="flex items-center mt-1">
			<div className={`w-3 h-3 rounded-full ${getStatusStyle()}`}></div>
			<span className="text-xs ml-1">{status}</span>
		</div>
	);
}
