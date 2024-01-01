import { ReactNode, useLayoutEffect, useRef } from "react";
import { randomUUID } from "crypto";

export class TagOption {
	id: string;
	value: string;
	icon?: ReactNode;
}

export function InputTags(props: {
	tags: TagOption[];
	onChange: (tags: TagOption[]) => void;
	onRemove: (tag: TagOption) => void;
	inputPlaceholder?: string;
	excludeTriggerKeys?: string[];
}): JSX.Element {
	const { tags } = props;
	const inputRef = useRef<HTMLInputElement>(null);

	const onTagRemove = (id: string) => {
		const newTags = tags.filter((tag) => tag.id !== id);
		props.onChange(newTags);
	};

	// listen tab\enter\space\comma
	useLayoutEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const { key } = e;

			if (props.excludeTriggerKeys?.includes(key)) {
				return;
			}

			if (key === "Tab" || key === "Enter" || key === " ") {
				e.preventDefault();
				const value = inputRef.current?.value;
				const id = randomUUID();
				if (value) {
					const newTags = [...tags, { id, value }];
					props.onChange(newTags);
					inputRef.current!.value = "";
				}
			}
		};
		inputRef.current?.addEventListener("keydown", onKeyDown);
		return () => {
			inputRef.current?.removeEventListener("keydown", onKeyDown);
		};
	});

	return (
		<>
			<div className="attachment-input-tags">
				<div className="tags">
					{tags?.map((tag, index) => {
						return (
							<div className="tag" key={tag.id}>
								<span className="icon">{tag.icon}</span>
								<span>{tag.value}</span>
								<span
									className="remove-button"
									onClick={() => onTagRemove(tag.id)}
								>
									x
								</span>
							</div>
						);
					})}
				</div>
				<input
					ref={inputRef}
					className="input"
					placeholder={props.inputPlaceholder}
				/>
			</div>
		</>
	);
}
