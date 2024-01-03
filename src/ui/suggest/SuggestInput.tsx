import * as React from "react";
import { CSSProperties } from "react";
import { getLocal } from "src/i18/messages";
import { Suggest, SuggestItem } from "./Suggest";

export function SuggestInput(props: {
	inputPlaceholder?: string;
	onInputChange: (value: string) => void;
	onSelected: (item: SuggestItem) => void;
	getItems: (query: string) => SuggestItem[];
	defaultInputValue?: string;
	style?: CSSProperties;
}): JSX.Element {
	const { inputPlaceholder } = props;
	const [value, setValue] = React.useState(props.defaultInputValue);
	const [showSuggest, setShowSuggest] = React.useState(false);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const local = getLocal();
	return (
		<>
			<input
				type="text"
				placeholder={
					inputPlaceholder
						? inputPlaceholder
						: local.FILE_POSITION_PATH_INPUT_PLACEHOLDER
				}
				ref={inputRef}
				onChange={(e) => {
					props.onInputChange(e.target.value);
					setValue(e.target.value);
					setShowSuggest(true);
				}}
				value={value}
			/>
			{inputRef.current && (
				<Suggest
					query={value || ""}
					showSuggest={showSuggest}
					getItems={props.getItems}
					onSelected={(item) => {
						props.onSelected(item);
						setValue(item.value);
						setShowSuggest(false);
					}}
					anchorElement={inputRef.current}
					onOpenChange={(show) => setShowSuggest(show)}
				/>
			)}
		</>
	);
}
