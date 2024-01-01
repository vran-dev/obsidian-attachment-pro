import { DateTime } from "luxon";
import { App, TFile } from "obsidian";

export class VariableContext {
	[key: string]: any;

	static fromFile(app: App, file: TFile): VariableContext {
		const context = new VariableContext();
		context.file = file;
		// date context
		context.datetime = DateTime;
		context.timestamp = new Date().getTime();
		context.year = new Date().getFullYear();
		context.yearMonth = DateTime.now().toFormat("yyyyMM");
		context.filename = file.basename;

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

	static handle(input: string, app: App, file: TFile): string {
		if (input == undefined || input == null || input.trim() == "") return input;

		// eslint-disable-next-line
		const context = VariableContext.fromFile(app, file);
		const placeholderRegex = /\${(.*?)}/g;
		const replacedText = input.replace(
			placeholderRegex,
			(_, placeholder) => {
				const value = eval(`context.${placeholder.trim()}`);
				return value !== undefined ? String(value) : placeholder;
			}
		);
		return replacedText;
	}
}
