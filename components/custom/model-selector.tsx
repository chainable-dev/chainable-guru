"use client";

import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModel } from "@/lib/hooks/use-model";

function ModelLabel({ model }: { model: { id: string; name: string; provider: string } }) {
	return (
		<div className="flex items-center gap-2">
			<span>{model.name}</span>
			{model.provider === 'ollama' && (
				<span className="rounded bg-green-100 px-1 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
					Local
				</span>
			)}
		</div>
	);
}

export function ModelSelector({
	selectedModelId,
	className,
}: {
	selectedModelId: string;
	className?: string;
}) {
	const { 
		models, 
		selectedModel, 
		isLoading, 
		handleModelChange,
		fetchModels 
	} = useModel();

	useEffect(() => {
		fetchModels();
	}, [fetchModels]);

	return (
		<Select
			value={selectedModel?.id}
			onValueChange={handleModelChange}
		>
			<SelectTrigger className={className}>
				<SelectValue>
					{isLoading ? (
						"Loading models..."
					) : (
						selectedModel ? (
							<ModelLabel model={selectedModel} />
						) : (
							"Select a model"
						)
					)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{models.map((model) => (
					<SelectItem key={model.id} value={model.id}>
						<ModelLabel model={model} />
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
