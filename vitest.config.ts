import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	resolve: {
		alias: {
			// 单测在 Node 环境运行，obsidian 包只有类型没有实现，
			// 运行时指向最小测试替身
			obsidian: path.resolve(__dirname, "test/mocks/obsidian.ts"),
			src: path.resolve(__dirname, "src"),
		},
	},
	test: {
		environment: "node",
		include: ["test/**/*.test.ts"],
	},
});
