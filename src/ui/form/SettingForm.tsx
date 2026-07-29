import {
	AttachmentProConfig,
	AttachmentRule,
	AttachmentScope,
	DefaultRule,
	ScopeRangeItem,
	createRepositorySetting,
	createScope,
	isRangedScope,
} from "src/manager/types";
import {
	attachmentNameFormatOptions,
	operationOptions,
	scopeOptions,
	repositoryOptions,
} from "../reactSettingTab";
import { Select } from "../select/Select";
import { ReactNode, useState } from "react";
import { LL } from "@src/i18n/i18n";
import { InputTags } from "../tags/InputTags";
import { DateTime } from "luxon";
import { DEFAULT_DATETIME_FORMAT, LUXON_FORMAT_DOC_URL, SAMPLE_DATE } from "src/manager/constants";
import { swapSave } from "src/util/sort";
import { ChevronDown, ChevronUp, Folder, Tags, File } from "lucide-react";
import {
	autoUpdate,
	flip,
	inline,
	offset,
	shift,
	useFloating,
	useHover,
	useInteractions,
} from "@floating-ui/react";
import {
	getDateTimeOptions,
	getFolderOptions,
	getTagOptions,
	getVariableOptions,
} from "../suggestOptions";
import { SuggestInput } from "../suggest/SuggestInput";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { SuggestItem } from "../suggest/Suggest";

export function SettingForm(props: {
	title: string;
	config: AttachmentProConfig;
	onChange: (config: AttachmentProConfig) => void;
}): ReactNode {
	const app = useObsidianApp();
	const { onChange } = props;
	const [config, setConfig] = useState(props.config);

	const onRuleChange = (rule: AttachmentRule) => {
		const newConfig = {
			...config,
			rules: config.rules.map((item) => {
				if (item.id === rule.id) {
					return rule;
				}
				return item;
			}),
		};
		setConfig(newConfig);
		onChange(newConfig);
	};

	const onRuleRemove = (rule: AttachmentRule) => {
		const newConfig = {
			...config,
			rules: config.rules.filter((item) => item.id !== rule.id),
		};
		setConfig(newConfig);
		onChange(newConfig);
	};

	const onRuleAdd = () => {
		const rule = new DefaultRule();
		// 新规则排在现有规则之后执行
		rule.sort =
			Math.max(-1, ...config.rules.map((item) => item.sort ?? 0)) + 1;
		const newConfig = {
			...config,
			rules: [...config.rules, rule],
		};
		setConfig(newConfig);
		onChange(newConfig);
	};

	const move = (ruleId: string, up: boolean) => {
		const newRules = [...config.rules];
		const index = newRules.findIndex((o) => o.id === ruleId);
		if (index >= 0) {
			if (up) {
				swapSave(newRules, index, index - 1);
			} else {
				swapSave(newRules, index, index + 1);
			}
			const newConfig = {
				...config,
				// 重排后将 sort 与展示顺序对齐，保证执行优先级与 UI 一致
				rules: newRules.map((rule, i) => ({ ...rule, sort: i })),
			};
			setConfig(newConfig);
			onChange(newConfig);
		}
	};

	/** FILE_SUBFOLDER / CUSTOMIZE 仓库的目录路径变更 */
	const onRepositoryPathChange = (rule: AttachmentRule, path: string) => {
		const { repository } = rule;
		if (
			repository.type !== "FILE_SUBFOLDER" &&
			repository.type !== "CUSTOMIZE"
		) {
			return;
		}
		onRuleChange({ ...rule, repository: { ...repository, path } });
	};

	/** 作用域取值列表（扩展名/目录/标签）变更 */
	const onScopeRangesChange = (
		rule: AttachmentRule,
		scope: AttachmentScope,
		ranges: ScopeRangeItem[]
	) => {
		onRuleChange({
			...rule,
			scopes: rule.scopes.map((item) =>
				item.id === scope.id && isRangedScope(item)
					? { ...item, ranges }
					: item
			),
		});
	};

	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltip, setTooltip] = useState("");

	const { refs, floatingStyles, context } = useFloating({
		open: showTooltip,
		onOpenChange: setShowTooltip,
		middleware: [offset(6), flip(), shift(), inline()],
		whileElementsMounted: autoUpdate,
	});

	const hover = useHover(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

	return (
		<div className="attachment-pro-setting">
			{showTooltip && (
				<>
					<div
						ref={(node) => refs.setFloating(node)}
						className="tooltip"
						style={{
							...floatingStyles,
							animation: "none",
						}}
						{...getFloatingProps()}
					>
						{tooltip}
					</div>
				</>
			)}
			{config.rules.map((rule) => {
				return (
					<div key={rule.id} className="attachment-pro-form">
						<div data-rule-id={rule.id} className="form-toolbar">
							<div className="title">{props.title}</div>
							<div
								className="menu-item"
								onClick={() => move(rule.id, true)}
								onMouseEnter={(e) => {
									// currentTarget 在事件派发结束后会被置空，先取出元素供闭包使用
									const el = e.currentTarget;
									refs.setPositionReference({
										getBoundingClientRect: () =>
											el.getBoundingClientRect(),
										getClientRects: () =>
											el.getClientRects(),
									});
									setTooltip(LL.SETTING.MOVE_UP_TOOLTIP());
									setShowTooltip(true);
								}}
								onMouseLeave={() => setShowTooltip(false)}
								{...getReferenceProps()}
							>
								<ChevronUp />
							</div>
							<div
								className="menu-item"
								onClick={() => move(rule.id, false)}
								onMouseEnter={(e) => {
									const el = e.currentTarget;
									refs.setPositionReference({
										getBoundingClientRect: () =>
											el.getBoundingClientRect(),
										getClientRects: () =>
											el.getClientRects(),
									});
									setTooltip(LL.SETTING.MOVE_DOWN_TOOLTIP());
									setShowTooltip(true);
								}}
								onMouseLeave={() => setShowTooltip(false)}
								{...getReferenceProps()}
							>
								<ChevronDown />
							</div>
						</div>
						<div className="form-item">
							<div className="form-label">
								{LL.FILE_POSITION.LABEL()}
								<div className="form-description">
									{LL.FILE_POSITION.DESC()}
								</div>
							</div>
							<div className="form-vertical-content">
								<Select
									defaultValue={rule.repository.type}
									options={repositoryOptions}
									onChange={(value) => {
										onRuleChange({
											...rule,
											repository:
												createRepositorySetting(value),
										});
									}}
								/>
								{rule.repository.type === "FILE_SUBFOLDER" ||
								rule.repository.type === "CUSTOMIZE" ? (
									<>
										<SuggestInput
											inputPlaceholder={
												LL.FILE_POSITION.PATH_INPUT_PLACEHOLDER()
											}
											onInputChange={(value: string) => {
												onRepositoryPathChange(
													rule,
													value
												);
											}}
											onSelected={(item) => {
												onRepositoryPathChange(
													rule,
													item.value
												);
											}}
											defaultInputValue={
												rule.repository.path
											}
											getItems={(query: string) => {
												return [...getFolderOptions(
													query,
													app
												), ...getVariableOptions(query)];
											}}
										/>
									</>
								) : null}
							</div>
						</div>

						{rule.scopes.map((scope, index) => {
							return (
								<div className="form-item" key={index}>
									<div className="form-label">
										{LL.SCOPE.LABEL()}
										<div className="form-description">
											{LL.SCOPE.DESC()}
										</div>
									</div>
									<div className="form-vertical-content">
										<div className="form-content">
											<Select
												defaultValue={scope.type}
												options={scopeOptions}
												onChange={(value) => {
													onRuleChange({
														...rule,
														// 切换类型时重建作用域，重置 ranges/operator
														scopes: rule.scopes.map(
															(item) =>
																item.id ===
																scope.id
																	? createScope(
																			item.id,
																			value
																	)
																	: item
														),
													});
												}}
											/>
											{scope.type === "FILE_TAG" ? (
												<>
													<Select
														defaultValue={
															scope.operator
														}
														options={
															operationOptions
														}
														onChange={(value) => {
															onRuleChange({
																...rule,
																scopes: rule.scopes.map(
																	(item) =>
																		item.id ===
																			scope.id &&
																		item.type ===
																			"FILE_TAG"
																			? {
																					...item,
																					operator:
																						value,
																			}
																			: item
																),
															});
														}}
													/>
												</>
											) : null}
										</div>

										<ScopeInputTag
											scope={scope}
											onChange={(newRanges) => {
												onScopeRangesChange(
													rule,
													scope,
													newRanges
												);
											}}
										/>
									</div>
								</div>
							);
						})}

						<div className="form-item">
							<div className="form-label">
								{LL.FILE_NAME_FORMAT.LABEL()}
								<div className="form-description">
									{rule.nameFormat.type == "DATETIME" ? (
										<>
											{LL.FILE_NAME_FORMAT.DATETIME_DESC()}{" "}
											<a
												href={LUXON_FORMAT_DOC_URL}
												target="_blank"
												rel="noopener noreferrer"
											>
												{LL.FILE_NAME_FORMAT.DATETIME_DESC_DOC()}
											</a>
										</>
									) : (
										LL.FILE_NAME_FORMAT.DESC()
									)}
								</div>
							</div>
							<div className="form-vertical-content">
								<Select
									defaultValue={rule.nameFormat.type}
									options={attachmentNameFormatOptions}
									onChange={(value) => {
										onRuleChange({
											...rule,
											nameFormat: {
												type: value,
												format:
													value === "DATETIME"
														? DEFAULT_DATETIME_FORMAT
														: "",
											},
										});
									}}
								/>
								{rule.nameFormat.type === "DATETIME" ||
								rule.nameFormat.type === "CUSTOMIZE" ? (
									<>
										<SuggestInput
											inputPlaceholder={
												rule.nameFormat.type === "DATETIME" ?
												LL.FILE_NAME_FORMAT.DATETIME_INPUT_PLACEHOLDER():
												LL.FILE_NAME_FORMAT.CUSTOM_INPUT_PLACEHOLDER()
											}
											defaultInputValue={
												rule.nameFormat.format
											}
											onInputChange={(value) => {
												onRuleChange({
													...rule,
													nameFormat: {
														...rule.nameFormat,
														format: value,
													},
												});
											}}
											onSelected={(item) => {
												onRuleChange({
													...rule,
													nameFormat: {
														...rule.nameFormat,
														format: item.value,
													},
												});
											}}
											getItems={(query: string) => {
												return getDateTimeOptions(
													query
												);
											}}
										/>
									</>
								) : null}

								{rule.nameFormat.type === "DATETIME" ? (
									<div className="form-description">
										{LL.FILE_NAME_FORMAT.EXAMPLE()}
										{": "}
										{rule.nameFormat.format
											? DateTime.fromJSDate(
													SAMPLE_DATE
											).toFormat(
													rule.nameFormat.format ||
														DEFAULT_DATETIME_FORMAT
											)
											: ""}
									</div>
								) : null}

								{rule.nameFormat.type === "CUSTOMIZE" ? (
									<div className="form-description">
										{LL.FILE_NAME_FORMAT.EXAMPLE()}
										{": "}
										{LL.FILE_NAME_FORMAT.CUSTOM_DESC({
											attachmentName: "${attachmentName}",
											notename: "${notename}",
											uuid: "${uuid}",
										})}
									</div>
								) : null}
							</div>
						</div>

						<div>
							<button onClick={() => onRuleRemove(rule)}>
								{LL.SETTING.RULE_DELETE_BUTTON_TEXT()}
							</button>
						</div>
					</div>
				);
			})}

			<div>
				<button onClick={() => onRuleAdd()}>
					{LL.SETTING.RULE_ADD_BUTTON_TEXT()}
				</button>
			</div>
		</div>
	);
}

function ScopeInputTag(props: {
	scope: AttachmentScope;
	onChange: (ranges: ScopeRangeItem[]) => void;
}): ReactNode {
	const { scope } = props;
	const app = useObsidianApp();

	if (!isRangedScope(scope)) {
		return <></>;
	}

	const excludeTriggerKeys =
		scope.type === "SPECIFIC_FILE_FOLDER" ? [" "] : [];

	let placeholder = "";
	let icon: ReactNode | null = null;
	let getItems: (query: string) => SuggestItem[] = () => [];
	switch (scope.type) {
		case "ATTACHMENT_FILE_EXTENSION":
			icon = <File />;
			placeholder = LL.SCOPE.EXTENSION_VALUE_INPUT_PLACEHOLDER();
			break;
		case "SPECIFIC_FILE_FOLDER":
			icon = <Folder />;
			placeholder = LL.SCOPE.SPECIFIC_FOLDER_INPUT_PLACEHOLDER();
			getItems = (query) => getFolderOptions(query, app);
			break;
		case "FILE_TAG":
			icon = <Tags />;
			placeholder = LL.SCOPE.TAG_VALUE_INPUT_PLACEHOLDER();
			getItems = (query) => getTagOptions(query, app);
			break;
	}
	const tags = scope.ranges.map((range) => {
		return {
			id: range.id,
			value: range.value,
			icon: icon,
		};
	});
	return (
		<InputTags
			inputPlaceholder={placeholder}
			tags={tags}
			excludeTriggerKeys={excludeTriggerKeys}
			onChange={(newTags) => {
				props.onChange(
					newTags.map((t) => {
						return {
							id: t.id,
							value: t.value,
						};
					})
				);
			}}
			getItems={getItems}
			onRemove={() => {}}
		/>
	);
}
