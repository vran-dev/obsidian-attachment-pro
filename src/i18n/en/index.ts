import type { BaseTranslation } from '../i18n-types'

const en = {
	FILE_POSITION: {
		LABEL: "Default location",
		DESC: "Specify the location where files should be saved",
		PATH_INPUT_PLACEHOLDER: "Please enter the file path",
		TYPE: {
			ROOT: "Repository root directory",
			CURRENT: "Current file's directory",
			SUBFOLDER: "Subfolder",
			CUSTOM: "Custom directory path"
		}
	},
	SCOPE: {
		LABEL: "Scope",
		DESC: "The scope where the rule is applicable",
		TYPE: {
			ALL: "All",
			SPECIFIC_EXTENSION: "Specific file type",
			SPECIFIC_FOLDER: "Specific folder",
			TAG_OPS: "Tag",
			CUSTOM: "Custom"
		},
		TAG_VALUE_INPUT_PLACEHOLDER: "Please enter the tag, such as todo. then press Enter",
		EXTENSION_VALUE_INPUT_PLACEHOLDER: "Please enter the file type suffix, such as png. then press Enter",
		SPECIFIC_FOLDER_INPUT_PLACEHOLDER: "Please enter the folder path, such as /images"
	},
	FILE_NAME_FORMAT: {
		LABEL: "File Name Format",
		DESC: "Automatically convert the file name to the specified format",
		DATETIME_DESC: "Automatically convert the file name to the specified format.",
		DATETIME_DESC_DOC: "See Luxon Format",
		EXAMPLE: "Example",
		DATETIME_INPUT_PLACEHOLDER: "Default is yyyyMMddHHmmss",
		CUSTOM_INPUT_PLACEHOLDER: "Please enter the custom format",
		CUSTOM_DESC: "You can use {attachmentName}, {notename} or {uuid} and so on",
		TYPE: {
			DATETIME: "Current Time",
			UUID: "Global Unique Identifier (UUID)",
			ORIGINAL: "Original File Name",
			CUSTOM: "Custom Format"
		}
	},
	SETTING: {
		RULE_DELETE_BUTTON_TEXT: "Delete",
		RULE_ADD_BUTTON_TEXT: "Add",
		MOVE_UP_TOOLTIP: "Move Up",
		MOVE_DOWN_TOOLTIP: "Move Down",
		OPERATOR_CONTAINS_ALL: "Contains All",
		OPERATOR_CONTAINS_ANY: "Contains Any",
	},
	ATTACHMENTS: {
		INSERT_SELECTED_ATTACHMENTS: "Insert Selected Attachments",
		LOADING: "Loading attachments...",
		EMPTY_TITLE: "No attachments found",
		EMPTY_DESC: "Try adjusting the filter criteria, or add attachments to the vault.",
		FILTER_IMAGES_ALL: "Images (All)",
		SEARCH_PLACEHOLDER: "Search by name",
		ONLY_UNUSED: "Only Unused",
		PREVIEW_UNSUPPORTED: "Preview not supported for this file type",
		PAGINATION_PREV: "Previous Page",
		PAGINATION_NEXT: "Next Page",
		MODAL_CLOSE: "Close",
	},
	NOTICES: {
		SAVE_FAILED: "Attachment Pro: Failed to save attachment"
	},
	COMMAND: {
		SHOW_ATTACHMENTS: "Show Attachments",
		CONTEXT_MENU_INSERT_ATTACHMENTS: "Insert from Attachments",
	}
} satisfies BaseTranslation

export default en
