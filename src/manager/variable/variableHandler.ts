import { DateTime } from "luxon";
import { App, TFile } from "obsidian";
import { safeEvaluate } from "./expressionEvaluator";

export class VariableContext {
	[key: string]: any;

	static fromFile(app: App, file: TFile, attachment?: File): VariableContext {
		const context = new VariableContext();
		context.file = file;
		// date context
		context.datetime = DateTime;
		context.timestamp = new Date().getTime();
		context.now = DateTime.now();
		context.year = new Date().getFullYear();
		context.yearMonth = DateTime.now().toFormat("yyyyMM");
		context.notename = file.basename;
		if (attachment) {
			const attachmentNameWithoutExtension = attachment.name.split(".")[0];
			context.attachmentName = attachmentNameWithoutExtension
		}

		// frontmatter
		const metadata = app.metadataCache.getFileCache(file);
		if (metadata) {
			context.frontmatter = metadata.frontmatter;
		} else {
			context.frontmatter = {};
		}
		return context;
	}
}

export default class DefaultVariableHandler {
	constructor() {}

	static handle(input: string, app: App, file: TFile, attachment?: File, index?: number): string {
		if (input == undefined || input == null || input.trim() == "") return input;

		const context = VariableContext.fromFile(app, file, attachment);
		const placeholderRegex = /\${(.*?)}/g;
		const replacedText = input.replace(
			placeholderRegex,
			(match, placeholder) => {
				const value = safeEvaluate(placeholder.trim(), context);
				// 求值失败时原样保留 ${...} 占位符，避免静默丢失用户配置
				return value !== undefined && value !== null
					? String(value)
					: match;
			}
		);

		if (index && index > 0 ){
			return replacedText+`-${index.toString().padStart(2, '0')}`;
		}
		return replacedText;
	}
}
