"use client";

interface ValidationErrorsProps {
	errors: string[];
	onClose: () => void;
	onFixError?: (errorIndex: number) => void;
}

export default function ValidationErrors({ errors, onClose, onFixError }: ValidationErrorsProps) {
	if (errors.length === 0) return null;

	// 对错误进行分类
	const connectionErrors = errors.filter(
		(err) => err.includes("未连接") || err.includes("连接") || err.includes("路径")
	);
	const configErrors = errors.filter(
		(err) => err.includes("未配置") || err.includes("缺少") || err.includes("参数")
	);
	const otherErrors = errors.filter(
		(err) => !connectionErrors.includes(err) && !configErrors.includes(err)
	);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-xl w-full">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-red-600 dark:text-red-400">工作流验证错误</h3>
					<button
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						onClick={onClose}
					>
						✕
					</button>
				</div>

				<div className="mb-4">
					<p className="mb-2">请修复以下问题后再运行工作流:</p>

					{connectionErrors.length > 0 && (
						<div className="mb-3">
							<h4 className="font-medium text-sm mb-1 text-blue-600">连接问题</h4>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								{connectionErrors.map((error, index) => (
									<li key={`conn-${index}`} className="text-blue-600">
										{error}
									</li>
								))}
							</ul>
						</div>
					)}

					{configErrors.length > 0 && (
						<div className="mb-3">
							<h4 className="font-medium text-sm mb-1 text-orange-600">配置问题</h4>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								{configErrors.map((error, index) => (
									<li key={`config-${index}`} className="text-orange-600">
										{error}
									</li>
								))}
							</ul>
						</div>
					)}

					{otherErrors.length > 0 && (
						<div className="mb-3">
							<h4 className="font-medium text-sm mb-1 text-red-600">其他问题</h4>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								{otherErrors.map((error, index) => (
									<li key={`other-${index}`} className="text-red-600">
										{error}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				<div className="flex justify-end space-x-2">
					<button
						className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
						onClick={onClose}
					>
						忽略
					</button>
					<button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
						我知道了
					</button>
				</div>
			</div>
		</div>
	);
}
