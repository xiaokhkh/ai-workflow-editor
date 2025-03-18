"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("错误边界捕获到错误:", error, errorInfo);
	}

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="p-4 border border-red-300 bg-red-50 rounded">
						<h3 className="text-lg font-medium text-red-800 mb-2">组件渲染错误</h3>
						<p className="text-red-600">{this.state.error?.message}</p>
						<button
							className="mt-3 px-3 py-1 bg-red-600 text-white rounded"
							onClick={() => this.setState({ hasError: false, error: null })}
						>
							重试
						</button>
					</div>
				)
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
