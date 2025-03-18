import React from "react";

interface HelpDocumentationProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function HelpDocumentation({ isOpen, onClose }: HelpDocumentationProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
			<div className="bg-white dark:bg-gray-800 rounded-lg w-4/5 max-w-4xl max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
					<h2 className="text-xl font-bold">工作流编辑器使用文档</h2>
					<button
						onClick={onClose}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className="p-6">
					<div className="space-y-8">
						{/* 基本介绍 */}
						<section>
							<h3 className="text-lg font-semibold mb-3">工作流编辑器简介</h3>
							<p className="mb-3">
								工作流编辑器是一个可视化工具，帮助您设计和构建复杂的AI处理流程。通过拖放、连接和配置不同类型的节点，您可以创建自定义工作流，无需编写代码。
							</p>
						</section>

						{/* 节点类型 */}
						<section>
							<h3 className="text-lg font-semibold mb-3">节点类型</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="border dark:border-gray-700 rounded-lg p-4">
									<div className="flex items-center mb-2">
										<div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
											<span className="text-blue-600 dark:text-blue-300">T</span>
										</div>
										<h4 className="font-medium">触发器节点</h4>
									</div>
									<p className="text-sm">
										工作流的起点，定义工作流何时开始执行。包括手动触发、定时触发、Webhook和事件触发等类型。
									</p>
								</div>

								<div className="border dark:border-gray-700 rounded-lg p-4">
									<div className="flex items-center mb-2">
										<div className="w-8 h-8 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2">
											<span className="text-indigo-600 dark:text-indigo-300">P</span>
										</div>
										<h4 className="font-medium">处理节点</h4>
									</div>
									<p className="text-sm">
										执行数据处理操作，如AI补全、API调用、数据转换等。每个处理节点都可以配置特定的参数。
									</p>
								</div>

								<div className="border dark:border-gray-700 rounded-lg p-4">
									<div className="flex items-center mb-2">
										<div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-2">
											<span className="text-amber-600 dark:text-amber-300">C</span>
										</div>
										<h4 className="font-medium">条件节点</h4>
									</div>
									<p className="text-sm">
										根据条件表达式决定工作流的分支路径。当条件评估为真或假时，工作流将沿不同路径继续执行。
									</p>
								</div>

								<div className="border dark:border-gray-700 rounded-lg p-4">
									<div className="flex items-center mb-2">
										<div className="w-8 h-8 rounded-md bg-green-100 dark:bg-green-900 flex items-center justify-center mr-2">
											<span className="text-green-600 dark:text-green-300">O</span>
										</div>
										<h4 className="font-medium">输出节点</h4>
									</div>
									<p className="text-sm">
										工作流的终点，定义结果如何输出。可以配置不同的输出格式，如文本、JSON、HTML等。
									</p>
								</div>
							</div>
						</section>

						{/* 基本操作 */}
						<section>
							<h3 className="text-lg font-semibold mb-3">基本操作</h3>
							<div className="space-y-4">
								<div>
									<h4 className="font-medium mb-2">创建节点</h4>
									<p className="text-sm mb-2">
										从顶部工具栏中拖拽所需节点类型到画布上。您也可以使用模板库快速创建预设工作流。
									</p>
								</div>

								<div>
									<h4 className="font-medium mb-2">连接节点</h4>
									<p className="text-sm mb-2">
										点击节点底部的输出锚点，拖动到目标节点顶部的输入锚点，创建一个连接。条件节点有两个输出锚点，分别代表条件为真和条件为假的路径。
									</p>
								</div>

								<div>
									<h4 className="font-medium mb-2">配置节点</h4>
									<p className="text-sm mb-2">
										点击任意节点在右侧面板中查看和修改节点属性。每种节点类型都有特定的配置选项。
									</p>
									<ul className="list-disc list-inside text-sm ml-4">
										<li>触发器节点：可配置触发方式</li>
										<li>处理节点：可选择处理类型和设置参数</li>
										<li>条件节点：编写条件表达式</li>
										<li>输出节点：设置输出格式和处理方式</li>
									</ul>
								</div>

								<div>
									<h4 className="font-medium mb-2">删除节点或连接</h4>
									<p className="text-sm mb-2">
										选中节点或连接后，按<kbd>Delete</kbd>或<kbd>Backspace</kbd>
										键删除。也可以在节点配置面板中使用删除按钮。
									</p>
								</div>
							</div>
						</section>

						{/* 工具栏功能 */}
						<section>
							<h3 className="text-lg font-semibold mb-3">工具栏功能</h3>
							<div className="space-y-3">
								<div className="flex items-start">
									<div className="w-24 text-sm font-medium">模板库</div>
									<div className="text-sm">
										快速加载预定义的工作流模板，包括对话流程、内容生成、数据处理等
									</div>
								</div>

								<div className="flex items-start">
									<div className="w-24 text-sm font-medium">导出</div>
									<div className="text-sm">将当前工作流导出为JSON文件，可用于备份或跨系统迁移</div>
								</div>

								<div className="flex items-start">
									<div className="w-24 text-sm font-medium">导入</div>
									<div className="text-sm">从JSON文件导入工作流，恢复之前保存的工作流设计</div>
								</div>

								<div className="flex items-start">
									<div className="w-24 text-sm font-medium">自动布局</div>
									<div className="text-sm">重新排列节点位置，使工作流更有条理、更易于理解</div>
								</div>

								<div className="flex items-start">
									<div className="w-24 text-sm font-medium">历史版本</div>
									<div className="text-sm">打开历史版本管理器，查看和恢复之前保存的工作流版本</div>
								</div>

								<div className="flex items-start">
									<div className="w-24 text-sm font-medium">验证</div>
									<div className="text-sm">检查工作流的有效性，确保所有节点连接正确且配置完整</div>
								</div>

								<div className="flex items-start">
									<div className="w-24 text-sm font-medium">运行</div>
									<div className="text-sm">模拟执行工作流，可视化展示数据在节点间的流动过程</div>
								</div>

								<div className="flex items-start">
									<div className="w-24 text-sm font-medium">撤销/重做</div>
									<div className="text-sm">
										撤销或重做最近的操作，快捷键：<kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd>
									</div>
								</div>
							</div>
						</section>

						{/* 高级功能 */}
						<section>
							<h3 className="text-lg font-semibold mb-3">高级功能</h3>
							<div className="space-y-4">
								<div>
									<h4 className="font-medium mb-2">条件表达式</h4>
									<p className="text-sm mb-2">
										条件节点使用JavaScript表达式评估条件。您可以引用上游节点传来的数据，如：
										<code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
											data.temperature &gt; 25 || data.humidity &lt; 40
										</code>
									</p>
								</div>

								<div>
									<h4 className="font-medium mb-2">AI补全配置</h4>
									<p className="text-sm mb-2">处理节点的AI补全类型允许配置多种参数：</p>
									<ul className="list-disc list-inside text-sm ml-4">
										<li>model：选择AI模型（如gpt-3.5-turbo、gpt-4、claude-3等）</li>
										<li>temperature：控制回复的创造性（0-1之间，值越低越确定性）</li>
										<li>maxTokens：限制输出长度</li>
										<li>systemPrompt：设置系统指令，引导AI行为</li>
									</ul>
								</div>

								<div>
									<h4 className="font-medium mb-2">API调用</h4>
									<p className="text-sm mb-2">处理节点的API调用类型允许向外部服务发送请求：</p>
									<ul className="list-disc list-inside text-sm ml-4">
										<li>endpoint：API的URL地址</li>
										<li>method：HTTP方法（GET、POST等）</li>
										<li>headers：请求头信息</li>
										<li>body：请求体内容（可引用上游节点的数据）</li>
									</ul>
								</div>

								<div>
									<h4 className="font-medium mb-2">自定义节点样式</h4>
									<p className="text-sm mb-2">
										您可以在节点配置中设置背景色和边框颜色，使工作流更直观易读。
									</p>
								</div>
							</div>
						</section>

						{/* 键盘快捷键 */}
						<section>
							<h3 className="text-lg font-semibold mb-3">键盘快捷键</h3>
							<div className="grid grid-cols-2 gap-2">
								<div className="flex justify-between">
									<span className="text-sm">撤销</span>
									<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
										Ctrl+Z
									</kbd>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">重做</span>
									<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
										Ctrl+Y
									</kbd>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">保存</span>
									<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
										Ctrl+S
									</kbd>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">删除选中项</span>
									<kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
										Delete
									</kbd>
								</div>
							</div>
						</section>

						{/* 使用提示 */}
						<section>
							<h3 className="text-lg font-semibold mb-3">使用技巧</h3>
							<ul className="list-disc list-inside text-sm space-y-2">
								<li>从简单工作流开始，逐步添加复杂功能</li>
								<li>使用命名约定，使节点名称清晰描述其功能</li>
								<li>定期使用验证功能，确保工作流正确</li>
								<li>使用自动布局优化复杂工作流的视觉呈现</li>
								<li>对重要版本使用历史管理器保存快照，避免意外丢失</li>
								<li>测试运行工作流，确保行为符合预期</li>
								<li>使用模板作为起点，根据需求进行修改</li>
							</ul>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
