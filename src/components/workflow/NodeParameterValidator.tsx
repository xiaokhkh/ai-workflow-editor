"use client";

import { useCallback, useState } from "react";

interface NodeParameterValidatorProps {
	nodeId: string;
	parameters: string;
	nodeType: string;
}

export default function NodeParameterValidator({
	nodeId,
	parameters,
	nodeType,
}: NodeParameterValidatorProps) {
	const [validationResult, setValidationResult] = useState<{
		isValid: boolean;
		message: string;
	}>({ isValid: true, message: "" });

	const [isValidating, setIsValidating] = useState(false);

	const validateParameters = useCallback(() => {
		setIsValidating(true);

		try {
			// 尝试解析JSON
			const parsedParams = JSON.parse(parameters);

			// 根据节点类型验证必要参数
			let isValid = true;
			let message = "";

			switch (nodeType) {
				case "trigger":
					if (!parsedParams.triggerType) {
						isValid = false;
						message = "触发器类型不能为空";
					}
					break;
				case "process":
					if (parsedParams.processType === "apiCall" && !parsedParams.endpoint) {
						isValid = false;
						message = "API调用节点必须指定endpoint";
					} else if (parsedParams.processType === "aiCompletion" && !parsedParams.model) {
						isValid = false;
						message = "AI补全节点必须指定model";
					}
					break;
				case "condition":
					if (!parsedParams.condition) {
						isValid = false;
						message = "条件节点必须指定条件表达式";
					}
					break;
			}

			setValidationResult({ isValid, message });
		} catch (e) {
			setValidationResult({
				isValid: false,
				message: "参数格式无效：" + (e instanceof Error ? e.message : String(e)),
			});
		}

		setIsValidating(false);
	}, [parameters, nodeType]);

	return (
		<div className="mt-2">
			<button
				className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
				onClick={validateParameters}
				disabled={isValidating}
			>
				{isValidating ? "验证中..." : "验证参数"}
			</button>

			{validationResult.message && (
				<div
					className={`mt-2 p-2 text-sm rounded ${
						validationResult.isValid
							? "bg-green-50 text-green-700 border border-green-200"
							: "bg-red-50 text-red-700 border border-red-200"
					}`}
				>
					{validationResult.message}
				</div>
			)}
		</div>
	);
}
