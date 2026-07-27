import {
	AttachmentProConfig,
	AttachmentRepositorySetting,
	AttachmentScope,
	ScopeRangeItem,
} from "./types";

/**
 * 配置迁移入口：每次加载配置后执行，必须保持幂等。
 * 后续 schema 变更统一在此追加迁移逻辑。
 *
 * - 历史版本设置面板对「仓库根目录」写入的 repository.type 是
 *   "VAULT_SUBFOLDER"，而仓库匹配端判断的是 "ROOT_FOLDER"，两者不一致
 *   会导致附件被静默丢弃，这里把存量坏值统一迁移为 "ROOT_FOLDER"。
 * - 补齐历史数据可能缺失的字段（path/ranges/operator），保证运行时
 *   数据与判别联合类型（types.ts）一致。
 * - 规则数组按 sort 稳定排序，保证展示顺序与执行顺序一致。
 */
export function migrateConfig(raw: AttachmentProConfig): AttachmentProConfig {
	const rules = (raw.rules ?? [])
		.map((rule) => ({
			...rule,
			repository: migrateRepository(rule.repository),
			scopes: (rule.scopes ?? []).map(migrateScope),
		}))
		.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
	return { ...raw, debug: raw.debug ?? false, rules };
}

/** data.json 中的历史仓库配置：type 可能是坏值，path 可能缺失 */
interface LegacyRepositorySetting {
	type?: string;
	path?: unknown;
}

function migrateRepository(
	repository: AttachmentRepositorySetting
): AttachmentRepositorySetting {
	const legacy = (repository ?? {}) as LegacyRepositorySetting;
	const type = legacy.type === "VAULT_SUBFOLDER" ? "ROOT_FOLDER" : legacy.type;
	switch (type) {
		case "FILE_SUBFOLDER":
		case "CUSTOMIZE":
			return {
				type,
				path: typeof legacy.path === "string" ? legacy.path : "",
			};
		case "ROOT_FOLDER":
		case "FILE_FOLDER":
		case "OBSIDIAN_DEFAULT":
			return { type };
		default:
			// 未知类型原样保留，由仓库注册表在保存时报错提示
			return repository;
	}
}

/** data.json 中的历史作用域：ranges/operator 可能缺失 */
interface LegacyScope {
	type?: string;
	ranges?: unknown;
	operator?: unknown;
}

function migrateScope(scope: AttachmentScope): AttachmentScope {
	const legacy = (scope ?? {}) as LegacyScope;
	switch (legacy.type) {
		case "ATTACHMENT_FILE_EXTENSION":
		case "SPECIFIC_FILE_FOLDER":
			return {
				...scope,
				type: legacy.type,
				ranges: normalizeRanges(legacy.ranges),
			};
		case "FILE_TAG":
			return {
				...scope,
				type: legacy.type,
				ranges: normalizeRanges(legacy.ranges),
				// 历史版本未持久化 operator 时按 CONTAINS_ANY 匹配，保持一致
				operator:
					legacy.operator === "CONTAINS_ALL"
						? "CONTAINS_ALL"
						: "CONTAINS_ANY",
			};
		default:
			return scope;
	}
}

function normalizeRanges(ranges: unknown): ScopeRangeItem[] {
	return Array.isArray(ranges) ? (ranges as ScopeRangeItem[]) : [];
}
