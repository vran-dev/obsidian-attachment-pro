import { CalendarDays, Folder, Variable, Tag } from "lucide-react";
import { TFolder, TAbstractFile, App, TFile, getAllTags } from "obsidian";
import { SuggestItem } from "./suggest/Suggest";

export const dateTimeFormatOptions: SuggestItem[] = [
	{
		id: "yyyyMMddHHmmss",
		icon: <CalendarDays />,
		label: "yyyyMMddHHmmss",
		value: "yyyyMMddHHmmss",
		description: "20210101120000",
	},
	{
		id: "yyyy-MM-dd HH:mm:ss",
		icon: <CalendarDays />,
		label: "yyyy-MM-dd HH:mm:ss",
		value: "yyyy-MM-dd HH:mm:ss",
		description: "2021-01-01 12:00:00",
	},
	{
		id: "yyyyMMddHHmmssS",
		icon: <CalendarDays />,
		label: "yyyyMMddHHmmssS",
		value: "yyyyMMddHHmmssS",
		description: "20240102222007179",
	},
];

export const variablesOptions: SuggestItem[] = [
	{
		id: "filename",
		icon: <Variable />,
		label: "${filename}",
		value: "${filename}",
		description: "The name of the target page",
	},
	{
		id: "year",
		icon: <Variable />,
		label: "${year}",
		value: "${year}",
		description: "current year, e.g. 2023",
	},
	{
		id: "yearMonth",
		icon: <Variable />,
		label: "${yearMonth}",
		value: "${yearMonth}",
		description: "current year with month, e.g. 202312",
	},
	{
		id: "timestamp",
		icon: <Variable />,
		label: "${timestamp}",
		value: "${timestamp}",
		description: "current timestamp, e.g. 1704205498270",
	},
	{
		id: "datetime-now",
		icon: <Variable />,
		label: "${datetime.now()}",
		value: "${datetime.now()}",
		description: "luxon DateTime object reference, you can use any method",
	},
	{
		id: "metadata",
		icon: <Variable />,
		label: "${metadata.created}",
		value: "${metadata.created}",
		description:
			"page frontmatter metadata object reference, you can use it to reference property.",
	},
	{
		id: "file-name",
		icon: <Variable />,
		label: "${file.name}",
		value: "${file.name}",
		description: "obsidian file object reference.",
	},
];

export function getVariableOptions(query: string): SuggestItem[] {
	return variablesOptions.filter(
		(item) =>
			item.label.toLowerCase().contains(query.toLowerCase()) ||
			item.description?.toLowerCase().contains(query.toLowerCase())
	);
}

export function getDateTimeOptions(query: string): SuggestItem[] {
	return dateTimeFormatOptions.filter(
		(item) =>
			item.label.toLowerCase().contains(query.toLowerCase()) ||
			item.description?.toLowerCase().contains(query.toLowerCase())
	);
}

export function getFolderOptions(query: string, app: App): SuggestItem[] {
	const abstractFiles = app.vault.getAllLoadedFiles();
	const folders: TFolder[] = [];
	const lowerCaseInputStr = query.toLowerCase();
	abstractFiles.forEach((folder: TAbstractFile) => {
		if (
			folder instanceof TFolder &&
			folder.path.toLowerCase().contains(lowerCaseInputStr)
		) {
			folders.push(folder);
		}
	});
	const data = folders.map((folder) => {
		return {
			id: folder.path,
			icon: <Folder />,
			label: folder.name,
			value: folder.path,
			description: folder.path,
		};
	});
	return data;
}

export function getTagOptions(inputStr: string, app: App): SuggestItem[] {
	const abstractFiles = app.vault.getAllLoadedFiles();
	const tags: string[] = [];
	const lowerCaseInputStr = inputStr.toLowerCase();
	abstractFiles.forEach((file: TAbstractFile) => {
		if (file instanceof TFile) {
			const cache = this.app.metadataCache.getCache(file.path);
			if (cache) {
				const fileTags = getAllTags(cache);
				fileTags?.forEach((tag) => {
					if (
						tag.toLowerCase().contains(lowerCaseInputStr) &&
						!tags.includes(tag)
					) {
						tags.push(tag);
					}
				});
			}
		}
	});
	return tags.map((tag) => {
		return {
			id: tag,
			icon: <Tag />,
			label: tag,
			value: tag.substring(1),
		};
	});
}
