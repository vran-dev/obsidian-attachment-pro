import * as React from "react";

export function useSuggest(props: {
	items: SuggestItem[];
	defaultValue: string;
}): JSX.Element {
	return <div className="suggest-container">
    
  </div>
}

export interface SuggestItem {
	id: string;
	label: string;
	value: string;
	icon?: React.ReactNode;
	description?: string;
}
