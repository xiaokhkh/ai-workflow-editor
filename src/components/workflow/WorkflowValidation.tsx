"use client";

import React from "react";

interface WorkflowValidationProps {
	errors: string[];
}

export default function WorkflowValidation({ errors }: WorkflowValidationProps) {
	if (errors.length === 0) return null;

	return (
		<div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 max-w-2xl">
			<div className="flex">
				<div className="flex-shrink-0">
					<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
				<div className="ml-3">
					<h3 className="text-sm font-medium text-red-800">
						工作流存在 {errors.length} 个验证问题
					</h3>
					<div className="mt-2 text-sm text-red-700">
						<ul className="list-disc pl-5 space-y-1">
							{errors.map((error, index) => (
								<li key={index}>{error}</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
