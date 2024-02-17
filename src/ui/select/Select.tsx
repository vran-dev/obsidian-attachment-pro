import { useState } from "react";

export function Select(props: {
	options: {
		value: string;
		label: string;
	}[];
	defaultValue: string;
	onChange?: (value: string) => void;
}) {
	const [value, setValue] = useState(props.defaultValue);
	return (
		<select
			className="select"
			value={value}
			onChange={(e) => {
				setValue(e.target.value);
				if (props.onChange) {
					props.onChange(e.target.value);
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
