import { AttachmentScope } from "src/manager/types";
import { AttachmentScopeMatcher } from "./attachmentScopeMatcher";

export default class CustomizeAttachmentScopeMatcher implements AttachmentScopeMatcher {
	accept(scope: AttachmentScope): boolean {
		return scope.type === "CUSTOMIZE";
	}

	match() {
		// TODO
		return false;
	}
}
