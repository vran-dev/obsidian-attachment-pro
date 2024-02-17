import EnLocalMessage from "./enLocalMessage";
import ZhLocalMessage from "./zhLocalMessage";

export interface Message {
	// file position
	FILE_POSITION_LABEL: string;
	FILE_POSITION_DESC: string;
	FILE_POSITION_PATH_INPUT_PLACEHOLDER: string;
	// file position type
	FILE_POSITION_TYPE_ROOT: string;
	FILE_POSITION_TYPE_CURRENT: string;
	FILE_POSITION_TYPE_SUBFOLDER: string;
	FILE_POSITION_TYPE_CUSTOM: string;

	// scope
	SCOPE_LABEL: string;
	SCOPE_DESC: string;
	// scope type
	SCOPE_TYPE_ALL: string;
	SCOPE_TYPE_SPECIFIC_EXTENSION: string;
	SCOPE_TYPE_SPECIFIC_FOLDER: string;
	SCOPE_TYPE_TAG_OPS: string;
	SCOPE_TYPE_CUSTOM: string;
	SCOPE_TAG_VALUE_INPUT_PLACEHOLDER: string;
	SCOPE_EXTENSION_VALUE_INPUT_PLACEHOLDER: string;
	SCOPE_SPCIFIC_FOLDER_INPUT_PLACEHOLDER: string;

	// file name format
	FILE_NAME_FORMAT_LABEL: string;
	FILE_NAME_FORMAT_DESC: string;
	FILE_NAME_FORMAT_DATTIME_DESC: string;
	EXAMPLE: string;
	FILE_NAME_FORMAT_DATETIME_INPUT_PLACEHOLDER: string;
	FILE_NAME_FORMAT_CUSTOM_INPUT_PLACEHOLDER: string;
	FILE_NAME_FORMAT_CUSTOM_DESC: string;

	// name format type
	FILE_NAME_FORMAT_TYPE_DATETIME: string;
	FILE_NAME_FORMAT_TYPE_UUID: string;
	FILE_NAME_FORMAT_TYPE_ORIGINAL: string;
	FILE_NAME_FORMAT_TYPE_ORDER: string;
	FILE_NAME_FORMAT_TYPE_CUSTOM: string;

	// button
	RULE_DELETE_BUTTON_TEXT: string;
	RULE_ADD_BUTTON_TEXT: string;
	MOVE_UP_TOOLTIP: string;
	MOVE_DOWN_TOOLTIP: string;

	// operator
	OPERATOR_CONTAINS_ALL: string;
	OPERATOR_CONTAINS_ANY: string;
}

export function getLocal(): Message {
	const lang = window.localStorage.getItem("language");
	switch (lang) {
		case "zh":
			return new ZhLocalMessage();
		default:
			return new EnLocalMessage();
	}
}
