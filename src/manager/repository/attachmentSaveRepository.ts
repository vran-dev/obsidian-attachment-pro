import { App, TFile } from "obsidian";
import { AttachmentRule, AttachmentSaveType } from "src/manager/types";
import FileFolderAttachmentRepository from "./fileFolderAttachmentRepository";
import FileSubfolderAttachmentRepository from "./fileSubfolderAttachmentRepository";
import VaultfolderAttachmentRepository from "./vaultfolderAttachmentRepository";
import { log } from "src/util/log";
import CustomizeAttachmentRepository from "./customizeAttachmentRepository";

export interface AttachmentRepository {
	accept(scope: AttachmentSaveType): boolean;

	save(context: AttachmentRepositoryContext): Promise<AttachmentResult>;
}

export class AttachmentResult {
	file: TFile;
	link: string;
}

export class AttachmentRepositoryContext {
	public attachmentFile: File;
	public formatedAttachmentName: string;
	public pageFile: TFile;
	public rule: AttachmentRule;
	public app: App;
}

export const attachmentRepositories: AttachmentRepository[] = [
	new FileFolderAttachmentRepository(),
	new FileSubfolderAttachmentRepository(),
	new VaultfolderAttachmentRepository(),
	new CustomizeAttachmentRepository(),
];

export class AttachmentRepositories {
	static async handle(context: AttachmentRepositoryContext, onSave: (link: AttachmentResult) => void): Promise<void> {
		const { rule, attachmentFile, pageFile } = context;
		const handler = attachmentRepositories.find((h) =>
			h.accept(context.rule.repository.type)
		);

		if (!handler) {
			log(
				"[No Repository Match] no repository found for rule: ",
				rule.repository
			);
			return;
		}

		log(
			"[Repository Before Handle] use " +
				rule.repository.type +
				" to handle attachment: " +
				attachmentFile.name +
				" at target page " +
				pageFile.name
		);
		const result = await handler.save(context);
		log(
			"[Repository Post Handle] " +
				pageFile.name +
				", attachment saved and link inserted: ",
			result.link
		);
		onSave(result)
	}
}
