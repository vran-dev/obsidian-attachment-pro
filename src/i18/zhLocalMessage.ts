import { Message } from "./messages";

export default class ZhLocalMessage implements Message {
	FILE_POSITION_LABEL = "文件位置";
	FILE_POSITION_DESC = "指定文件要保存的位置";
	FILE_POSITION_PATH_INPUT_PLACEHOLDER = "请输入文件路径";

	// file position type
	FILE_POSITION_TYPE_ROOT = "仓库的根目录";
	FILE_POSITION_TYPE_CURRENT = "当前文件所在目录";
	FILE_POSITION_TYPE_SUBFOLDER = "当前文件所在子目录";
	FILE_POSITION_TYPE_CUSTOM = "自定义目录路径";

	SCOPE_LABEL = "适用范围";
	SCOPE_DESC = "该规则生效的范围";
	// scope type
	SCOPE_TYPE_ALL = "全部";
	SCOPE_TYPE_SPECIFIC_EXTENSION = "指定文件类型";
	SCOPE_TYPE_SPECIFIC_FOLDER = "指定目录";
	SCOPE_TYPE_TAG_OPS = "标签";
	SCOPE_TYPE_CUSTOM = "自定义";

	SCOPE_TAG_VALUE_INPUT_PLACEHOLDER = "请输入标签, 按下回车或空格确定";
	SCOPE_EXTENSION_VALUE_INPUT_PLACEHOLDER = "请输入文件类型的后缀，比如 png. 按下回车或空格确定";
	SCOPE_SPCIFIC_FOLDER_INPUT_PLACEHOLDER = "请填写目录路径，按下回车确定";

	// file name format
	FILE_NAME_FORMAT_LABEL = "文件名格式化";
	FILE_NAME_FORMAT_DESC = "自动将文件名称转为指定的格式";
	FILE_NAME_FORMAT_DATTIME_DESC =
		this.FILE_NAME_FORMAT_DESC +
		" 查看 <a href='https://moment.github.io/luxon/#/formatting?id=table-of-tokens'>Luxon Format</a>";
	EXAMPLE = "示例";
	FILE_NAME_FORMAT_DATETIME_INPUT_PLACEHOLDER = "默认为 yyyyMMddHHmmss";
	FILE_NAME_FORMAT_CUSTOM_INPUT_PLACEHOLDER = "请输入自定义格式";
	FILE_NAME_FORMAT_CUSTOM_DESC = "你可以使用 ${attachmentName}, ${notename} 或 ${uuid} 等等";

	// name format type
	FILE_NAME_FORMAT_TYPE_DATETIME = "当前时间";
	FILE_NAME_FORMAT_TYPE_ORIGINAL = "原始文件名";
	FILE_NAME_FORMAT_TYPE_ORDER = "序号格式";
	FILE_NAME_FORMAT_TYPE_CUSTOM = "自定义格式";
	FILE_NAME_FORMAT_TYPE_UUID = "全局唯一标识符（UUID）";

	RULE_DELETE_BUTTON_TEXT = "删除";
	RULE_ADD_BUTTON_TEXT = "添加";
	MOVE_UP_TOOLTIP = "向上移动";
	MOVE_DOWN_TOOLTIP = "向下移动";

	OPERATOR_CONTAINS_ALL = "包含以下全部";
	OPERATOR_CONTAINS_ANY = "包含任意一个";
}
