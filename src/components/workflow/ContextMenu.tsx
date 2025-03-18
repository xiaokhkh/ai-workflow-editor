"use client";

import { Edge, Node, useReactFlow } from "reactflow";
import { useCallback, useEffect, useRef, useState } from "react";

interface ContextMenuProps {
	selectedNode: Node | null;
	selectedEdge: Edge | null;
	setSelectedNode: (node: Node | null) => void;
	setSelectedEdge: (edge: Edge | null) => void;
}

export default function ContextMenu({
	selectedNode,
	selectedEdge,
	setSelectedNode,
	setSelectedEdge,
}: ContextMenuProps) {
	const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const { deleteElements, setEdges } = useReactFlow();

	// 处理右键点击事件
	useEffect(() => {
		const handleContextMenu = (event: MouseEvent) => {
			// 只有当有选中的节点或边时才显示右键菜单
			if (selectedNode || selectedEdge) {
				event.preventDefault();
				setMenuPosition({ x: event.clientX, y: event.clientY });
			}
		};

		// 处理点击其他区域关闭菜单
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as globalThis.Node)) {
				setMenuPosition(null);
			}
		};

		document.addEventListener("contextmenu", handleContextMenu);
		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("contextmenu", handleContextMenu);
			document.removeEventListener("click", handleClickOutside);
		};
	}, [selectedNode, selectedEdge]);

	// 删除选中的元素
	const handleDelete = useCallback(() => {
		if (selectedNode) {
			deleteElements({ nodes: [selectedNode] });
			setSelectedNode(null);
		} else if (selectedEdge) {
			setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
			setSelectedEdge(null);
		}
		setMenuPosition(null);
	}, [selectedNode, selectedEdge, deleteElements, setEdges, setSelectedNode, setSelectedEdge]);

	if (!menuPosition) return null;

	return (
		<div
			ref={menuRef}
			className="absolute bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 py-1 z-50"
			style={{
				left: menuPosition.x,
				top: menuPosition.y,
				minWidth: "120px",
			}}
		>
			<button
				className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
				onClick={handleDelete}
			>
				删除
			</button>
			{selectedNode && (
				<>
					<button
						className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						onClick={() => {
							// 复制节点
							// 实现复制功能
							setMenuPosition(null);
						}}
					>
						复制
					</button>
				</>
			)}
		</div>
	);
}
