import { AttachmentSaveType } from "src/manager/types";
import {
	AttachmentRepository,
	AttachmentRepositoryContext,
	AttachmentResult,
} from "./attachmentSaveRepository";
import { appendOrderIfConflict } from "src/util/file";
import { generateAttachmentLink } from "src/util/linkGenerator";

/**
 * 模板方法基类：save() 固化「读取内容 → 解析路径 → 冲突改名 → 落盘 →
 * 生成链接」五步流程，子类只需实现 resolvePath 提供目标完整路径。
 */
export abstract class BaseAttachmentRepository implements AttachmentRepository {
	abstract accept(type: AttachmentSaveType): boolean;

	/** 解析附件的完整目标路径；需要建目录的子类在此自行创建目录 */
	protected abstract resolvePath(
		context: AttachmentRepositoryContext
	): string | Promise<string>;

	async save(context: AttachmentRepositoryContext): Promise<AttachmentResult> {
		const buffer = await context.attachmentFile.arrayBuffer();
		const fullPath = await this.resolvePath(context);
		const filePath = appendOrderIfConflict(fullPath, context.app);
		const tFile = await context.app.vault.createBinary(filePath, buffer);
		const link = generateAttachmentLink(tFile, context.app);
		return { file: tFile, link };
	}
}
