import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { safeEvaluate } from "src/manager/variable/expressionEvaluator";

const fixedNow = DateTime.fromISO("2026-07-26T14:30:05.000", { zone: "utc" });

function buildContext(): Record<string, unknown> {
	return {
		now: fixedNow,
		datetime: DateTime,
		timestamp: 1753500000000,
		year: 2026,
		yearMonth: "202607",
		notename: "my-note",
		frontmatter: { created: "2026-01-15", nested: { deep: "v" } },
		file: { name: "my-note.md", basename: "my-note", extension: "md" },
		calc: {
			add: (a: number, b: number) => a + b,
			echo: (v: unknown) => v,
		},
	};
}

describe("safeEvaluate — 合法表达式", () => {
	it("纯属性访问", () => {
		expect(safeEvaluate("notename", buildContext())).toBe("my-note");
		expect(safeEvaluate("year", buildContext())).toBe(2026);
	});

	it("嵌套属性访问", () => {
		expect(safeEvaluate("frontmatter.created", buildContext())).toBe(
			"2026-01-15"
		);
		expect(safeEvaluate("file.name", buildContext())).toBe("my-note.md");
		expect(safeEvaluate("frontmatter.nested.deep", buildContext())).toBe(
			"v"
		);
	});

	it("带字符串参数的方法调用（核心用例）", () => {
		expect(safeEvaluate("now.toFormat('yyyy')", buildContext())).toBe(
			"2026"
		);
		expect(
			safeEvaluate("now.toFormat('yyyyMMddHHmmss')", buildContext())
		).toBe("20260726143005");
	});

	it("双引号参数同样支持", () => {
		expect(safeEvaluate('now.toFormat("yyyyMM")', buildContext())).toBe(
			"202607"
		);
	});

	it("空白容忍", () => {
		expect(
			safeEvaluate("  now.toFormat( 'yyyy' )  ", buildContext())
		).toBe("2026");
	});

	it("无参方法调用（datetime.now() 依赖 isCall 标记而非 args.length）", () => {
		const result = safeEvaluate("datetime.now()", buildContext());
		expect(DateTime.isDateTime(result)).toBe(true);
	});

	it("链式方法调用", () => {
		expect(
			safeEvaluate("now.toUTC().toFormat('yyyy')", buildContext())
		).toBe("2026");
	});

	it("数字与布尔字面量参数", () => {
		expect(safeEvaluate("calc.add(1, 2)", buildContext())).toBe(3);
		expect(safeEvaluate("calc.echo(true)", buildContext())).toBe(true);
		expect(safeEvaluate("calc.echo(1.5)", buildContext())).toBe(1.5);
	});
});

describe("safeEvaluate — 拒绝与兜底", () => {
	it("未知根变量返回 undefined", () => {
		expect(safeEvaluate("unknown", buildContext())).toBeUndefined();
	});

	it("继承属性不可作为根变量（如 toString）", () => {
		expect(safeEvaluate("toString", buildContext())).toBeUndefined();
	});

	it("原型链逃逸被阻断", () => {
		expect(safeEvaluate("file.constructor", buildContext())).toBeUndefined();
		expect(safeEvaluate("file.__proto__", buildContext())).toBeUndefined();
		expect(
			safeEvaluate("calc.add.prototype", buildContext())
		).toBeUndefined();
	});

	it("注入类语法整体拒绝", () => {
		expect(
			safeEvaluate("now.toFormat('yyyy');evil()", buildContext())
		).toBeUndefined();
		expect(safeEvaluate("file['name']", buildContext())).toBeUndefined();
		expect(safeEvaluate("1+2", buildContext())).toBeUndefined();
		expect(safeEvaluate("new Date()", buildContext())).toBeUndefined();
	});

	it("对象字面量参数被有意拒绝", () => {
		expect(
			safeEvaluate("now.plus({years:1})", buildContext())
		).toBeUndefined();
	});

	it("起始必须是标识符", () => {
		expect(safeEvaluate("123", buildContext())).toBeUndefined();
		expect(safeEvaluate("'str'", buildContext())).toBeUndefined();
		expect(safeEvaluate("", buildContext())).toBeUndefined();
	});

	it("调用非函数属性返回 undefined", () => {
		expect(safeEvaluate("notename.foo()", buildContext())).toBeUndefined();
	});

	it("链路中出现 null/undefined 时返回 undefined", () => {
		expect(
			safeEvaluate("frontmatter.missing.deep", buildContext())
		).toBeUndefined();
	});
});
