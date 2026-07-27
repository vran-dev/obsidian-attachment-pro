import { useState } from "react";

export interface SelectOption<T extends string> {
	value: T;
	label: string;
}

export function Select<T extends string>(props: {
	options: SelectOption<T>[];
	defaultValue: T;
	onChange?: (value: T) => void;
}) {
	const [value, setValue] = useState(props.defaultValue);
	return (
		<select
			className="select"
			value={value}
			onChange={(e) => {
				// option 的 value 都来自 props.options，断言回 T 是安全的
				const selected = e.target.value as T;
				setValue(selected);
				if (props.onChange) {
					props.onChange(selected);
				}
			}}
		>
			{props.options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
}
