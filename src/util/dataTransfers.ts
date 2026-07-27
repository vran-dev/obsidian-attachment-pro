export function isAllStringType(dataItems: DataTransferItemList) {
	for (let i = 0; i < dataItems.length; i++) {
		const item = dataItems[i];
		if (item.kind != "string") {
			return false;
		}
	}
	return true;
}
