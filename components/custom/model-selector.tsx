"use client";

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Model {
	id: string;
	name: string;
	provider: 'openai' | 'ollama';
}

export function ModelSelector({
	selectedModelId,
	className,
}: {
	selectedModelId: string;
	className?: string;
}) {
	const router = useRouter();
	const [models, setModels] = useState<Model[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchModels() {
			try {
				const response = await fetch('/api/models');
				const data = await response.json();
				setModels(data.models);
			} catch (error) {
				console.error('Error fetching models:', error);
				toast.error('Failed to load available models');
			} finally {
				setLoading(false);
			}
		}

		fetchModels();
	}, []);

	const selectedModel = models.find(model => model.id === selectedModelId) || models[0];

	const handleModelChange = (value: string) => {
		const newModel = models.find(m => m.id === value);
		if (newModel) {
			toast.success(`Switched to ${newModel.name}${newModel.provider === 'ollama' ? ' (Local)' : ''}`);
			router.push(`/?model=${value}`);
		}
	};

	return (
		<Select
			value={selectedModel?.id}
			onValueChange={handleModelChange}
		>
			<SelectTrigger className={className}>
				<SelectValue>
					{loading ? (
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

function ModelLabel({ model }: { model: Model }) {
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
