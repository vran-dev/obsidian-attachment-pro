import { randomUUID } from "crypto";
import { CalendarDays, Folder, Variable, Tag } from "lucide-react";
import { TFolder, TAbstractFile, App, TFile, getAllTags } from "obsidian";
import { SuggestItem } from "./suggest/Suggest";

export const dateTimeFormatOptions: SuggestItem[] = [
	{
		id: randomUUID(),
		icon: <CalendarDays />,
		label: "yyyyMMddHHmmss",
		value: "yyyyMMddHHmmss",
		description: "20210101120000",
	},
	{
		id: randomUUID(),
		icon: <CalendarDays />,
		label: "yyyy-MM-dd HH:mm:ss",
		value: "yyyy-MM-dd HH:mm:ss",
		description: "2021-01-01 12:00:00",
	},
	{
		id: randomUUID(),
		icon: <CalendarDays />,
		label: "yyyyMMddHHmmssS",
		value: "yyyyMMddHHmmssS",
		description: "20240102222007179",
	},
];

export const variablesOptions: SuggestItem[] = [
	{
		id: randomUUID(),
		icon: <Variable />,
		label: "${filename}",
		value: "${filename}",
		description: "The name of the target page",
	},
	{
		id: randomUUID(),
		icon: <Variable />,
		label: "${year}",
		value: "${year}",
		description: "current year, e.g. 2023",
	},
	{
		id: randomUUID(),
		icon: <Variable />,
		label: "${yearMonth}",
		value: "${yearMonth}",
		description: "current year with month, e.g. 202312",
	},
	{
		id: randomUUID(),
		icon: <Variable />,
		label: "${timestamp}",
		value: "${timestamp}",
		description: "current timestamp, e.g. 1704205498270",
	},
	{
		id: randomUUID(),
		icon: <Variable />,
		label: "${datetime.now()}",
		value: "${datetime.now()}",
		description: "luxon DateTime object reference, you can use any method",
	},
	{
		id: randomUUID(),
		icon: <Variable />,
		label: "${metadata.created}",
		value: "${metadata.created}",
		description:
			"page frontmatter metadata object reference, you can use it to reference property.",
	},
	{
		id: randomUUID(),
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

const folderQueryCacheMap = new Map<string, SuggestItem[]>();

export function getFolderOptions(query: string, app: App): SuggestItem[] {
	const cacheData = folderQueryCacheMap.get(query);
	if (cacheData) {
		return cacheData;
	}
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
			id: randomUUID(),
			icon: <Folder />,
			label: folder.name,
			value: folder.path,
			description: folder.path,
		};
	});
	folderQueryCacheMap.set(query, data);
	// clear cache after 10 seconds
	setTimeout(() => {
		folderQueryCacheMap.delete(query);
	}, 10000);
	return data;
}

export function getTagOptions(inputStr: string, app: App): SuggestItem[] {
	const abstractFiles = this.app.vault.getAllLoadedFiles();
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
			id: randomUUID(),
			icon: <Tag />,
			label: tag,
			value: tag.substring(1),
		};
	});
}
