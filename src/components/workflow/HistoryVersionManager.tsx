import { Edge, Node } from "reactflow";
import { useCallback, useEffect, useState } from "react";

type HistoryVersion = {
	id: string;
	name: string;
	date: string;
	nodes: Node[];
	edges: Edge[];
};

interface HistoryVersionManagerProps {
	isOpen: boolean;
	onClose: () => void;
	nodes: Node[];
	edges: Edge[];
	setNodes: (nodes: Node[]) => void;
	setEdges: (edges: Edge[]) => void;
	setHistory: React.Dispatch<
		React.SetStateAction<{
			past: { nodes: Node[]; edges: Edge[] }[];
			future: { nodes: Node[]; edges: Edge[] }[];
		}>
	>;
}

export default function HistoryVersionManager({
	isOpen,
	onClose,
	nodes,
	edges,
	setNodes,
	setEdges,
	setHistory,
}: HistoryVersionManagerProps) {
	const [versions, setVersions] = useState<HistoryVersion[]>([]);
	const [versionName, setVersionName] = useState("");
	const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

	// 加载历史版本
	useEffect(() => {
		if (isOpen) {
			const savedVersions = localStorage.getItem("workflow-versions");
			if (savedVersions) {
				setVersions(JSON.parse(savedVersions));
			}
		}
	}, [isOpen]);

	// 保存当前版本
	const saveCurrentVersion = useCallback(() => {
		if (!versionName.trim()) {
			alert("请输入版本名称");
			return;
		}

		const newVersion: HistoryVersion = {
			id: Date.now().toString(),
			name: versionName,
			date: new Date().toLocaleString("zh-CN"),
			nodes,
			edges,
		};

		const updatedVersions = [...versions, newVersion];
		setVersions(updatedVersions);
		localStorage.setItem("workflow-versions", JSON.stringify(updatedVersions));
		setVersionName("");
	}, [versionName, nodes, edges, versions]);

	// 加载选中的版本
	const loadVersion = useCallback(() => {
		if (!selectedVersionId) return;

		const version = versions.find((v) => v.id === selectedVersionId);
		if (version) {
			// 保存当前状态到历史记录
			setHistory((prev) => ({
				past: [...prev.past, { nodes, edges }],
				future: [],
			}));

			setNodes(version.nodes);
			setEdges(version.edges);
			onClose();
		}
	}, [selectedVersionId, versions, setNodes, setEdges, onClose, setHistory, nodes, edges]);

	// 删除选中的版本
	const deleteVersion = useCallback(() => {
		if (!selectedVersionId) return;

		const updatedVersions = versions.filter((v) => v.id !== selectedVersionId);
		setVersions(updatedVersions);
		localStorage.setItem("workflow-versions", JSON.stringify(updatedVersions));
		setSelectedVersionId(null);
	}, [selectedVersionId, versions]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">工作流历史版本</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">
						✕
					</button>
				</div>

				<div className="mb-4">
					<div className="flex space-x-2">
						<input
							type="text"
							placeholder="输入版本名称"
							className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
							value={versionName}
							onChange={(e) => setVersionName(e.target.value)}
						/>
						<button
							onClick={saveCurrentVersion}
							className="px-3 py-2 bg-blue-500 text-white rounded"
						>
							保存当前版本
						</button>
					</div>
				</div>

				{versions.length > 0 ? (
					<div className="border rounded dark:border-gray-700 overflow-hidden">
						<table className="min-w-full">
							<thead>
								<tr className="bg-gray-100 dark:bg-gray-700">
									<th className="py-2 px-4 text-left">版本名称</th>
									<th className="py-2 px-4 text-left">保存时间</th>
								</tr>
							</thead>
							<tbody>
								{versions.map((version) => (
									<tr
										key={version.id}
										className={`border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
											selectedVersionId === version.id ? "bg-blue-50 dark:bg-blue-900" : ""
										}`}
										onClick={() => setSelectedVersionId(version.id)}
									>
										<td className="py-2 px-4">{version.name}</td>
										<td className="py-2 px-4">{version.date}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-gray-500 text-center py-4">暂无保存的历史版本</div>
				)}

				<div className="flex justify-end space-x-2 mt-4">
					<button
						onClick={deleteVersion}
						className="px-3 py-2 bg-red-500 text-white rounded disabled:opacity-50"
						disabled={!selectedVersionId}
					>
						删除选中版本
					</button>
					<button
						onClick={loadVersion}
						className="px-3 py-2 bg-green-500 text-white rounded disabled:opacity-50"
						disabled={!selectedVersionId}
					>
						加载选中版本
					</button>
				</div>
			</div>
		</div>
	);
}
