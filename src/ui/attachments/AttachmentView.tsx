import { App, MarkdownView, TFile } from "obsidian";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { AttachmentHandler } from "src/handler/attachmentsHandler";
import { File } from "lucide-react";
import Select, { MultiValue } from "react-select";
import { getLocal, Message } from "../../i18/messages";
import Modal from "../modal/Modal";
import { generateAttachmentLink } from "src/util/linkGenerator";
import { IMAGE_EXTENSIONS } from "src/manager/constants";
import "./AttachmentsModal.css"

type Option = {
	value: string;
	label: string;
};

class AttachmentFilter {
	name = "";
	extension: string[] = [];
	unused = false;
}

const supportPreviewExtensions = [...IMAGE_EXTENSIONS];

const pageSizeOptions = [
	{ value: 10, label: "10" },
	{ value: 20, label: "20" },
	{ value: 50, label: "50" },
];

/** 扩展名筛选下拉里「全部图片」选项的哨兵值 */
const ALL_IMAGES_VALUE = "AllImages";

// ---- 子组件定义在模块级：组件身份稳定，避免每次 render 重建导致
// 内部状态丢失与整棵子树重挂载（P2-3）。依赖一律通过 props 显式传入 ----

function Header(props: {
	local: Message;
	filter: AttachmentFilter;
	pageSize: number;
	attachmentExtensions: string[];
	onFilterChange: (filter: AttachmentFilter) => void;
	onPageSizeChange: (pageSize: number) => void;
}) {
	const { local, filter, pageSize, attachmentExtensions } = props;
	const allImageOption: Option = {
		value: ALL_IMAGES_VALUE,
		label: local.ATTACHMENTS_FILTER_IMAGES_ALL,
	};

	return (
		<div className="attachmentsPro--Header">
			<div className="attachmentsPro--HeaderControls">
				<Select<Option, true>
					isMulti
					name="extensions"
					className="basic-multi-select"
					classNamePrefix="select"
					isSearchable={false}
					value={filter.extension.map((extension) => {
						return { value: extension, label: extension };
					})}
					options={[
						allImageOption,
						...attachmentExtensions.map((extension) => {
							return { value: extension, label: extension };
						}),
					]}
					onChange={(newValue: MultiValue<Option>) => {
						if (
							newValue.some(
								(option) => option.value === ALL_IMAGES_VALUE
							)
						) {
							props.onFilterChange({
								...filter,
								extension: attachmentExtensions.filter((ext) =>
									IMAGE_EXTENSIONS.includes(ext)
								),
							});
						} else {
							props.onFilterChange({
								...filter,
								extension: newValue.map((o) => o.value),
							});
						}
					}}
				/>
				<input
					type="text"
					value={filter.name}
					onChange={(e) => {
						props.onFilterChange({
							...filter,
							name: e.target.value,
						});
					}}
					placeholder={local.ATTACHMENTS_SEARCH_PLACEHOLDER}
				/>
				<Select
					name="pageSize"
					className="basic-single-select"
					classNamePrefix="select"
					isSearchable={false}
					defaultValue={pageSizeOptions.find(
						(opt) => opt.value === pageSize
					)}
					options={pageSizeOptions}
					onChange={(selected) => {
						if (selected) {
							props.onPageSizeChange(selected.value);
						}
					}}
				/>
				<label>
					<input
						type="checkbox"
						checked={filter.unused}
						onChange={(e) => {
							props.onFilterChange({
								...filter,
								unused: e.target.checked,
							});
						}}
					/>
					{local.ATTACHMENTS_ONLY_UNUSED}
				</label>
			</div>
		</div>
	);
}

function PreviewModal(props: {
	app: App;
	local: Message;
	selectedFile: TFile;
	selectedFileType: string;
	onClose: () => void;
}) {
	const { app, local, selectedFile, selectedFileType } = props;

	const renderPreview = () => {
		if (supportPreviewExtensions.includes(selectedFileType)) {
			const filePath = app.vault.adapter.getResourcePath(
				selectedFile.path
			);
			if (IMAGE_EXTENSIONS.includes(selectedFileType)) {
				return (
					<img
						draggable={true}
						src={filePath}
						alt={selectedFile.name}
					/>
				);
			}
		} else {
			return <div>{local.ATTACHMENTS_PREVIEW_UNSUPPORTED}</div>;
		}
	};

	return (
		<Modal
			title={selectedFile.name}
			onClose={props.onClose}
			closeOnClickOutside={false}
		>
			<div
				className="attachmentsPro--ItemModal"
				onClick={props.onClose}
			>
				{renderPreview()}
			</div>
		</Modal>
	);
}

function Content(props: {
	app: App;
	attachments: TFile[];
	canInsert: boolean;
	selectedFiles: TFile[];
	onToggleSelect: (file: TFile) => void;
	onPreview: (file: TFile) => void;
}) {
	const { app, attachments, canInsert, selectedFiles } = props;

	const isSelected = (file: TFile) =>
		selectedFiles.some((f) => f.path === file.path);

	const renderPreview = (attachment: TFile) => {
		if (supportPreviewExtensions.includes(attachment.extension)) {
			const filePath = app.vault.adapter.getResourcePath(
				attachment.path
			);
			if (IMAGE_EXTENSIONS.includes(attachment.extension)) {
				return (
					<img
						draggable={true}
						src={filePath}
						alt={attachment.name}
					/>
				);
			}
		}
		return <File />;
	};

	return (
		<div className="attachmentsPro--Content">
			{attachments.map((attachment) => (
				<div
					className={`attachmentsPro--Item ${canInsert && isSelected(attachment) ? 'selected' : ''}`}
					key={attachment.path}
				>
					<div
						className="attachmentsPro--ItemPreview"
						onClick={() => props.onPreview(attachment)}
					>
						{renderPreview(attachment)}
						{canInsert && (
							<div
								className={`attachmentsPro--ItemCheckbox ${isSelected(attachment) ? 'selected' : ''}`}
								onClick={(e) => {
									e.stopPropagation();
									props.onToggleSelect(attachment);
								}}
							>
								{isSelected(attachment) ? '✓' : ''}
							</div>
						)}
					</div>
					<div className="attachmentsPro--ItemName">
						<a
							className="internal-link"
							href={attachment.path}
							aria-label={attachment.path}
							target="_blank"
							rel="noopener"
							onClick={(e) => {
								e.preventDefault();
								void app.workspace.openLinkText(attachment.name, attachment.path, true, { active: true });
							}}
						>
							{attachment.name}
						</a>
					</div>
				</div>
			))}
		</div>
	);
}

function Pagination(props: {
	local: Message;
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	canInsert: boolean;
	selectedCount: number;
	onInsert: () => void;
}) {
	const { local, page, totalPages, canInsert, selectedCount } = props;
	return (
		<div className="attachmentsPro--Pagination">
			<div className="attachmentsPro--PaginationButtons">
				<button
					onClick={() => props.onPageChange(Math.max(1, page - 1))}
					disabled={page === 1}
				>
					{local.PAGINATION_PREV}
				</button>
				<span>
					{page} / {totalPages}
				</span>
				<button
					onClick={() =>
						props.onPageChange(Math.min(totalPages, page + 1))
					}
					disabled={page === totalPages}
				>
					{local.PAGINATION_NEXT}
				</button>
			</div>
			{canInsert && selectedCount > 0 && (
				<div className="attachmentsPro--InsertButton">
					<button onClick={props.onInsert}>
						{local.INSERT_SELECTED_ATTACHMENTS} ({selectedCount})
					</button>
				</div>
			)}
		</div>
	);
}

export default function AttachmentView({
	canInsert = false ,
	onClose
}: {
	canInsert?: boolean,
	onClose: () => void;
}): ReactNode {
	const app = useObsidianApp();
	const local = getLocal();
	const [attachments, setAttachments] = useState<TFile[]>();
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [filter, setFilter] = useState(new AttachmentFilter());
	const [selectedFile, setSelectedFile] = useState<TFile>();
	const [selectedFiles, setSelectedFiles] = useState<TFile[]>([]);

	const handleAttachmentSelect = (file: TFile) => {
		setSelectedFiles(prev => {
			const isSelected = prev.some(f => f.path === file.path);
			if (isSelected) {
				return prev.filter(f => f.path !== file.path);
			} else {
				return [...prev, file];
			}
		});
	};

	const handleInsertAttachments = () => {
		const activeView = app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView && selectedFiles.length > 0) {
			const editor = activeView.editor;
			const cursor = editor.getCursor();
			const links = Array.from(selectedFiles)
				.map(attachment => generateAttachmentLink(attachment, app))
				.join('\n');
			editor.replaceRange(links, cursor);
			onClose();
		}
	};

	const attachmentExtensions = useMemo(() => {
		if (!attachments) {
			return [];
		}
		const distinct = new Set(
			attachments?.map((attachment) => attachment.extension)
		);
		return Array.from(distinct).sort();
	}, [attachments]);

	const listAttachments = useCallback(
		async (onlyUnused: boolean) => {
			setLoading(true);
			try {
				const attachmentHandler = new AttachmentHandler();
				const result = onlyUnused
					? await attachmentHandler.listUnusedAttachments(app)
					: await attachmentHandler.listAttachments(app);
				setAttachments(result);
			} finally {
				setLoading(false);
			}
		},
		[app]
	);

	useEffect(() => {
		void listAttachments(filter.unused);
	}, [filter.unused, listAttachments]);

	// 任何筛选条件变化都回到第一页，避免停留在已不存在的页码上
	const handleFilterChange = (next: AttachmentFilter) => {
		setPage(1);
		setFilter(next);
	};

	const handlePageSizeChange = (size: number) => {
		setPage(1);
		setPageSize(size);
	};

	const filteredAttachments = useMemo(() => {
		if (!attachments) {
			return [];
		}
		return attachments
			.filter((attachment) => {
				if (filter.name !== "") {
					return attachment.path
						.toLowerCase()
						.includes(filter.name.toLowerCase());
				}
				return true;
			})
			.filter((attachment) => {
				if (filter.extension.length >= 1) {
					return filter.extension.includes(attachment.extension);
				}
				return true;
			});
	}, [filter, attachments]);

	const paginatedAttachments = useMemo(() => {
		const start = (page - 1) * pageSize;
		const end = start + pageSize;
		return filteredAttachments.slice(start, end);
	}, [filteredAttachments, page, pageSize]);

	return (
		<div className="attachmentsPro--ViewContainer">
			<Header
				local={local}
				filter={filter}
				pageSize={pageSize}
				attachmentExtensions={attachmentExtensions}
				onFilterChange={handleFilterChange}
				onPageSizeChange={handlePageSizeChange}
			/>
			{loading ? (
				<div className="attachmentsPro--LoadingState">
					{local.ATTACHMENTS_LOADING}
				</div>
			) : filteredAttachments.length === 0 ? (
				<div className="attachmentsPro--EmptyState">
					<h3>{local.ATTACHMENTS_EMPTY_TITLE}</h3>
					<p>{local.ATTACHMENTS_EMPTY_DESC}</p>
				</div>
			) : (
				<>
					<Content
						app={app}
						attachments={paginatedAttachments}
						canInsert={canInsert}
						selectedFiles={selectedFiles}
						onToggleSelect={handleAttachmentSelect}
						onPreview={setSelectedFile}
					/>
					<Pagination
						local={local}
						page={page}
						totalPages={Math.ceil(
							filteredAttachments.length / pageSize
						)}
						onPageChange={setPage}
						canInsert={canInsert}
						selectedCount={selectedFiles.length}
						onInsert={handleInsertAttachments}
					/>
				</>
			)}
			{selectedFile && (
				<PreviewModal
					app={app}
					local={local}
					selectedFile={selectedFile}
					selectedFileType={selectedFile.extension}
					onClose={() => setSelectedFile(undefined)}
				/>
			)}
		</div>
	);
}
