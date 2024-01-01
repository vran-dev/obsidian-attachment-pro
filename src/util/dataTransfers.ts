export function isAllStringType(dataItems: DataTransferItemList) {
	for (let i = 0; i < dataItems.length; i++) {
		const item = dataItems[i];
		if (item.kind != "string") {
			return false;
		}
	}
	return true;
}

export function isAllFileType(dataItems: DataTransferItemList) {
	for (let i = 0; i < dataItems.length; i++) {
		const item = dataItems[i];
		if (item.kind != "file") {
			return false;
		}
	}
	return true;
}

export function isMixedType(dataItems: DataTransferItemList) {
	return !isAllStringType(dataItems) && !isAllFileType(dataItems);
}
