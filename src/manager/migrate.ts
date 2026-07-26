import { AttachmentProConfig } from "./types";

/**
 * 配置迁移入口：每次加载配置后执行，必须保持幂等。
 * 后续 schema 变更统一在此追加迁移逻辑。
 *
 * - 历史版本设置面板对「仓库根目录」写入的 repository.type 是
 *   "VAULT_SUBFOLDER"，而仓库匹配端判断的是 "ROOT_FOLDER"，两者不一致
 *   会导致附件被静默丢弃，这里把存量坏值统一迁移为 "ROOT_FOLDER"。
 * - 规则数组按 sort 稳定排序，保证展示顺序与执行顺序一致。
 */
export function migrateConfig(raw: AttachmentProConfig): AttachmentProConfig {
	const rules = (raw.rules ?? [])
		.map((rule) => {
			if ((rule.repository?.type as string | undefined) === "VAULT_SUBFOLDER") {
				return {
					...rule,
					repository: { ...rule.repository, type: "ROOT_FOLDER" as const },
				};
			}
			return rule;
		})
		.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
	return { ...raw, debug: raw.debug ?? false, rules };
}
