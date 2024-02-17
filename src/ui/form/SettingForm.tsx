import {
	AttachmentProConfig,
	AttachmentRule,
	AttachmentScope,
	AttachmentScopeType,
	DefaultRule,
} from "src/manager/types";
import {
	attachmentNameFormatOptions,
	operationOptions,
	scopeOptions,
	repositoryOptions,
} from "../reactSettingTab";
import { Select } from "../select/Select";
import { ReactNode, useState } from "react";
import { getLocal } from "src/i18/messages";
import { InputTags } from "../tags/InputTags";
import { DateTime } from "luxon";
import { DEFAULT_DATETIME_FORMAT, SAMPLE_DATE } from "src/manager/constants";
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
}): JSX.Element {
	const app = useObsidianApp();
	const { onChange } = props;
	const [config, setConfig] = useState(props.config);

	const local = getLocal();

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
		const newRules = [...config.rules, new DefaultRule()];
		const newConfig = {
			...config,
			rules: newRules,
		};
		setConfig({
			...config,
			rules: newRules,
		});
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
				rules: newRules,
			};
			setConfig(newConfig);
			onChange(newConfig);
		}
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
						ref={refs.setFloating}
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
			{config.rules.map((rule, index) => {
				return (
					<div key={rule.id} className="attachment-pro-form">
						<div data-rule-id={rule.id} className="form-toolbar">
							<div className="title">{props.title}</div>
							<div
								className="menu-item"
								onClick={() => move(rule.id, true)}
								onMouseEnter={(e) => {
									refs.setPositionReference({
										getBoundingClientRect: () =>
											//@ts-ignore
											e.target.getBoundingClientRect(),
										getClientRects: () =>
											//@ts-ignore
											e.target.getClientRects(),
									});
									setTooltip(local.MOVE_UP_TOOLTIP);
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
									refs.setPositionReference({
										getBoundingClientRect: () =>
											// @ts-ignore
											e.target.getBoundingClientRect(),
										getClientRects: () =>
											//@ts-ignore
											e.target.getClientRects(),
									});
									setTooltip(local.MOVE_DOWN_TOOLTIP);
									setShowTooltip(true);
								}}
								onMouseLeave={(e) => setShowTooltip(false)}
								{...getReferenceProps()}
							>
								<ChevronDown />
							</div>
						</div>
						<div className="form-item">
							<div className="form-label">
								{local.FILE_POSITION_LABEL}
								<div className="form-description">
									{local.FILE_POSITION_DESC}
								</div>
							</div>
							<div className="form-vertical-content">
								<Select
									defaultValue={rule.repository.type}
									options={repositoryOptions}
									onChange={(value) => {
										onRuleChange({
											...rule,
											repository: {
												//@ts-ignore
												type: value,
												path: "",
											},
										});
									}}
								/>
								{["FILE_SUBFOLDER", "CUSTOMIZE"].contains(
									rule.repository.type
								) ? (
									<>
										<SuggestInput
											inputPlaceholder={
												local.FILE_POSITION_PATH_INPUT_PLACEHOLDER
											}
											onInputChange={(value: string) => {
												onRuleChange({
													...rule,
													repository: {
														...rule.repository,
														path: value,
													},
												});
											}}
											onSelected={(item) => {
												onRuleChange({
													...rule,
													repository: {
														...rule.repository,
														path: item.value,
													},
												});
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
										{local.SCOPE_LABEL}
										<div className="form-description">
											{local.SCOPE_DESC}
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
														// @ts-ignore
														scopes: rule.scopes.map(
															(item) => {
																if (
																	item.id ===
																	scope.id
																) {
																	return {
																		...item,
																		type: value,
																		ranges: [], // reset ranges
																	};
																}
																return item;
															}
														),
													});
												}}
											/>
											{scope.type == "FILE_TAG" ? (
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
																	(item) => {
																		if (
																			item.id ===
																			scope.id
																		) {
																			return {
																				...item,
																				operator:
																					value,
																			};
																		}
																		return item;
																	}
																),
															});
														}}
													/>
												</>
											) : null}
										</div>

										<ScopeInputTag
											rule={rule}
											scope={scope}
											onChange={(newTags) => {
												const notModifiedScopes =
													rule.scopes.filter(
														(o) => o.id != scope.id
													);
												const modifiedScope = {
													...scope,
													ranges: newTags,
												};
												onRuleChange({
													...rule,
													scopes: [
														...notModifiedScopes,
														modifiedScope,
													],
												});
											}}
										/>
									</div>
								</div>
							);
						})}

						<div className="form-item">
							<div className="form-label">
								{local.FILE_NAME_FORMAT_LABEL}
								<div
									className="form-description"
									dangerouslySetInnerHTML={{
										__html:
											rule.nameFormat.type == "DATETIME"
												? local.FILE_NAME_FORMAT_DATTIME_DESC
												: local.FILE_NAME_FORMAT_DESC,
									}}
								></div>
							</div>
							<div className="form-vertical-content">
								<Select
									defaultValue={rule.nameFormat.type}
									options={attachmentNameFormatOptions}
									onChange={(value) => {
										onRuleChange({
											...rule,
											nameFormat: {
												//@ts-ignore
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
												local.FILE_NAME_FORMAT_DATETIME_INPUT_PLACEHOLDER:
												local.FILE_NAME_FORMAT_CUSTOM_INPUT_PLACEHOLDER
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
										{local.EXAMPLE}
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

								{
									// @ts-ignore
									rule.nameFormat.type === "CUSTOMIZE" ? (
										<div className="form-description">
											{local.EXAMPLE}
											{": "}
											{local.FILE_NAME_FORMAT_CUSTOM_DESC}
										</div>
									) : null
								}
							</div>
						</div>

						<div>
							<button onClick={() => onRuleRemove(rule)}>
								{local.RULE_DELETE_BUTTON_TEXT}
							</button>
						</div>
					</div>
				);
			})}

			<div>
				<button onClick={() => onRuleAdd()}>
					{local.RULE_ADD_BUTTON_TEXT}
				</button>
			</div>
		</div>
	);
}

function ScopeInputTag(props: {
	rule: AttachmentRule;
	scope: AttachmentScope;
	onChange: (tags: { id: string; value: string }[]) => void;
}): JSX.Element {
	const { scope } = props;
	const local = getLocal();
	const app = useObsidianApp();

	const scopeTypes: AttachmentScopeType[] = [
		"ATTACHMENT_FILE_EXTENSION",
		"SPECIFIC_FILE_FOLDER",
		"FILE_TAG",
	];
	if (!scopeTypes.contains(scope.type)) {
		return <></>;
	}

	const excludeTriggerKeys =
		scope.type == "SPECIFIC_FILE_FOLDER" ? [" "] : [];

	let placeholder = "";
	let icon: ReactNode | null = null;
	let getItems: (query: string) => SuggestItem[];
	switch (scope.type) {
		case "ATTACHMENT_FILE_EXTENSION":
			icon = <File />;
			placeholder = local.SCOPE_EXTENSION_VALUE_INPUT_PLACEHOLDER;
			getItems = () => [];
			break;
		case "SPECIFIC_FILE_FOLDER":
			icon = <Folder />;
			placeholder = local.SCOPE_SPCIFIC_FOLDER_INPUT_PLACEHOLDER;
			getItems = (query) => getFolderOptions(query, app);
			break;
		case "FILE_TAG":
			icon = <Tags />;
			placeholder = local.SCOPE_TAG_VALUE_INPUT_PLACEHOLDER;
			getItems = (query) => getTagOptions(query, app);
			break;
		default:
			icon = null;
			getItems = () => [];
	}
	const tags =
		//@ts-ignore
		scope.ranges?.map((range) => {
			return {
				id: range.id,
				value: range.value,
				icon: icon,
			};
		}) || [];
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
			onRemove={(tag) => {}}
		/>
	);
}
