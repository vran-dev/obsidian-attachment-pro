import { Message } from "./messages";

export default class EnLocalMessage implements Message {
	// file position
	FILE_POSITION_LABEL = "Default location";
	FILE_POSITION_DESC = "Where newly added attachments are placed";
	FILE_POSITION_PATH_INPUT_PLACEHOLDER = "Please enter the file path";

	FILE_POSITION_TYPE_ROOT = "Vault folder";
	FILE_POSITION_TYPE_CURRENT = "Same folder as current file";
	FILE_POSITION_TYPE_SUBFOLDER = "In subfolder under current folder";
	FILE_POSITION_TYPE_CUSTOM = "In the folder spcified below";

	SCOPE_LABEL = "Scope";
	SCOPE_DESC = "The scope in which the rule takes effect";
	// scope type
	SCOPE_TYPE_ALL = "All";
	SCOPE_TYPE_SPECIFIC_EXTENSION = "Specific File Extension";
	SCOPE_TYPE_SPECIFIC_FOLDER = "Specific Folder";
	SCOPE_TYPE_TAG_OPS = "Tag";
	SCOPE_TYPE_CUSTOM = "Custom";
	SCOPE_TAG_VALUE_INPUT_PLACEHOLDER = "Please enter the tag, such as todo. then press Enter";
	SCOPE_EXTENSION_VALUE_INPUT_PLACEHOLDER =
		"Please enter the file type suffix, such as png. then press Enter";
	SCOPE_SPCIFIC_FOLDER_INPUT_PLACEHOLDER = "Please enter the folder path, such as /images";
	// file name format
	FILE_NAME_FORMAT_LABEL = "File Name Format";
	FILE_NAME_FORMAT_DESC = "Automatically convert the file name to the specified format";
	FILE_NAME_FORMAT_DATTIME_DESC =
		this.FILE_NAME_FORMAT_DESC +
		" see more <a href='https://moment.github.io/luxon/#/formatting?id=table-of-tokens'>Luxon Format</a>";
	FILE_NAME_FORMAT_DATTIME_SAMPLE = "Example";
	FILE_NAME_FORMAT_DATETIME_INPUT_PLACEHOLDER = "Default is yyyyMMddHHmmss";
	FILE_NAME_FORMAT_CUSTOM_INPUT_PLACEHOLDER =
		"Please enter the custom format";

	// name format type
	FILE_NAME_FORMAT_TYPE_DATETIME = "Current Time";
	FILE_NAME_FORMAT_TYPE_ORIGINAL = "Original File Name";
	FILE_NAME_FORMAT_TYPE_ORDER = "Order Format";
	FILE_NAME_FORMAT_TYPE_CUSTOM = "Custom Format";
	FILE_NAME_FORMAT_TYPE_UUID = "UUID";

	RULE_DELETE_BUTTON_TEXT = "Delete";
	RULE_ADD_BUTTON_TEXT = "New";
	MOVE_UP_TOOLTIP = "Move Up";
	MOVE_DOWN_TOOLTIP = "Move Down";

	OPERATOR_CONTAINS_ALL = "Contains All";
	OPERATOR_CONTAINS_ANY = "Contains Any";
}
