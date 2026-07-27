import { describe, expect, it } from "vitest";
import { migrateConfig } from "src/manager/migrate";
import {
	AttachmentProConfig,
	FileTagScope,
	FileSubfolderRepository,
} from "src/manager/types";

function rawConfig(overrides: Record<string, unknown>): AttachmentProConfig {
	return {
		version: 0,
		debug: false,
		rules: [],
		...overrides,
	} as unknown as AttachmentProConfig;
}

function rawRule(overrides: Record<string, unknown>): Record<string, unknown> {
	return {
		id: "r1",
		sort: 0,
		enabled: true,
		scopes: [{ id: "s1", type: "ALL" }],
		repository: { type: "ROOT_FOLDER" },
		nameFormat: { type: "ORIGINAL" },
		...overrides,
	};
}

describe("migrateConfig", () => {
	it("历史坏值 VAULT_SUBFOLDER 迁移为 ROOT_FOLDER", () => {
		const config = migrateConfig(
			rawConfig({
				rules: [rawRule({ repository: { type: "VAULT_SUBFOLDER" } })],
			})
		);
		expect(config.rules[0].repository).toEqual({ type: "ROOT_FOLDER" });
	});

	it("FILE_SUBFOLDER / CUSTOMIZE 缺失 path 时补空串", () => {
		const config = migrateConfig(
			rawConfig({
				rules: [
					rawRule({ repository: { type: "FILE_SUBFOLDER" } }),
					rawRule({
						id: "r2",
						repository: { type: "CUSTOMIZE", path: "Res/img" },
					}),
				],
			})
		);
		expect(config.rules[0].repository).toEqual({
			type: "FILE_SUBFOLDER",
			path: "",
		});
		expect(config.rules[1].repository).toEqual({
			type: "CUSTOMIZE",
			path: "Res/img",
		});
	});

	it("未知仓库类型原样保留（交由注册表在保存时报错）", () => {
		const repository = { type: "FUTURE_TYPE", extra: 1 };
		const config = migrateConfig(
			rawConfig({ rules: [rawRule({ repository })] })
		);
		expect(config.rules[0].repository).toEqual(repository);
	});

	it("作用域缺失 ranges 时补空数组", () => {
		const config = migrateConfig(
			rawConfig({
				rules: [
					rawRule({
						scopes: [
							{ id: "s1", type: "ATTACHMENT_FILE_EXTENSION" },
						],
					}),
				],
			})
		);
		expect(config.rules[0].scopes[0]).toEqual({
			id: "s1",
			type: "ATTACHMENT_FILE_EXTENSION",
			ranges: [],
		});
	});

	it("FILE_TAG 缺失 operator 时按历史行为补 CONTAINS_ANY", () => {
		const config = migrateConfig(
			rawConfig({
				rules: [
					rawRule({
						scopes: [
							{
								id: "s1",
								type: "FILE_TAG",
								ranges: [{ id: "t", value: "work" }],
							},
						],
					}),
				],
			})
		);
		const scope = config.rules[0].scopes[0] as FileTagScope;
		expect(scope.operator).toBe("CONTAINS_ANY");
		expect(scope.ranges).toEqual([{ id: "t", value: "work" }]);
	});

	it("FILE_TAG 已有 CONTAINS_ALL 时保留", () => {
		const config = migrateConfig(
			rawConfig({
				rules: [
					rawRule({
						scopes: [
							{
								id: "s1",
								type: "FILE_TAG",
								ranges: [],
								operator: "CONTAINS_ALL",
							},
						],
					}),
				],
			})
		);
		expect((config.rules[0].scopes[0] as FileTagScope).operator).toBe(
			"CONTAINS_ALL"
		);
	});

	it("规则按 sort 升序排列", () => {
		const config = migrateConfig(
			rawConfig({
				rules: [
					rawRule({ id: "b", sort: 2 }),
					rawRule({ id: "a", sort: 1 }),
				],
			})
		);
		expect(config.rules.map((r) => r.id)).toEqual(["a", "b"]);
	});

	it("rules / debug 缺失时补默认值", () => {
		const config = migrateConfig(
			rawConfig({ rules: undefined, debug: undefined })
		);
		expect(config.rules).toEqual([]);
		expect(config.debug).toBe(false);
	});

	it("迁移是幂等的", () => {
		const raw = rawConfig({
			rules: [
				rawRule({
					repository: { type: "VAULT_SUBFOLDER" },
					scopes: [{ id: "s1", type: "FILE_TAG" }],
				}),
				rawRule({
					id: "r0",
					sort: -1,
					repository: { type: "FILE_SUBFOLDER", path: "img" },
				}),
			],
		});
		const once = migrateConfig(raw);
		const twice = migrateConfig(once);
		expect(twice).toEqual(once);
	});

	it("迁移后 FILE_SUBFOLDER 的 path 满足判别联合类型", () => {
		const config = migrateConfig(
			rawConfig({
				rules: [
					rawRule({
						repository: { type: "FILE_SUBFOLDER", path: "img" },
					}),
				],
			})
		);
		const repository = config.rules[0]
			.repository as FileSubfolderRepository;
		expect(repository.path).toBe("img");
	});
});
