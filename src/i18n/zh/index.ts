import type { BaseTranslation } from '../i18n-types'

const zh = {
	FILE_POSITION: {
		LABEL: "文件位置",
		DESC: "指定文件要保存的位置",
		PATH_INPUT_PLACEHOLDER: "请输入文件路径",
		TYPE: {
			ROOT: "仓库的根目录",
			CURRENT: "当前文件所在目录",
			SUBFOLDER: "当前文件所在子目录",
			CUSTOM: "自定义目录路径"
		}
	},
	SCOPE: {
		LABEL: "适用范围",
		DESC: "该规则生效的范围",
		TYPE: {
			ALL: "全部",
			SPECIFIC_EXTENSION: "指定文件类型",
			SPECIFIC_FOLDER: "指定目录",
			TAG_OPS: "标签",
			CUSTOM: "自定义"
		},
		TAG_VALUE_INPUT_PLACEHOLDER: "请输入标签, 按下回车或空格确定",
		EXTENSION_VALUE_INPUT_PLACEHOLDER: "请输入文件类型的后缀，比如 png. 按下回车或空格确定",
		SPECIFIC_FOLDER_INPUT_PLACEHOLDER: "请填写目录路径，按下回车确定"
	},
	FILE_NAME_FORMAT: {
		LABEL: "文件名格式化",
		DESC: "自动将文件名称转为指定的格式",
		DATETIME_DESC: "自动将文件名称转为指定的格式。",
		DATETIME_DESC_DOC: "查看 Luxon 格式文档",
		EXAMPLE: "示例",
		DATETIME_INPUT_PLACEHOLDER: "默认为 yyyyMMddHHmmss",
		CUSTOM_INPUT_PLACEHOLDER: "请输入自定义格式",
		CUSTOM_DESC: "你可以使用 {attachmentName}, {notename} 或 {uuid} 等等",
		TYPE: {
			DATETIME: "当前时间",
			UUID: "全局唯一标识符（UUID）",
			ORIGINAL: "原始文件名",
			CUSTOM: "自定义格式"
		}
	},
	SETTING: {
		RULE_DELETE_BUTTON_TEXT: "删除",
		RULE_ADD_BUTTON_TEXT: "添加",
		MOVE_UP_TOOLTIP: "向上移动",
		MOVE_DOWN_TOOLTIP: "向下移动",
		OPERATOR_CONTAINS_ALL: "包含以下全部",
		OPERATOR_CONTAINS_ANY: "包含任意一个",
	},
	ATTACHMENTS: {
		INSERT_SELECTED_ATTACHMENTS: "插入选中的附件",
		LOADING: "附件加载中...",
		EMPTY_TITLE: "没有找到附件",
		EMPTY_DESC: "试着调整筛选条件，或先向仓库中添加附件。",
		FILTER_IMAGES_ALL: "图片（全部）",
		SEARCH_PLACEHOLDER: "按名称搜索",
		ONLY_UNUSED: "仅未引用",
		PREVIEW_UNSUPPORTED: "无法预览该文件类型",
		PAGINATION_PREV: "上一页",
		PAGINATION_NEXT: "下一页",
		MODAL_CLOSE: "关闭",
	},
	NOTICES: {
		SAVE_FAILED: "Attachment Pro: 附件保存失败"
	},
	COMMAND: {
		SHOW_ATTACHMENTS: "打开附件库",
		CONTEXT_MENU_INSERT_ATTACHMENTS: "从附件库中插入",
	}
} satisfies BaseTranslation

export default zh
