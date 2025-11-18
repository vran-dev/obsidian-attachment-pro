import { App, MarkdownView, TFile } from "obsidian";
import { useEffect, useMemo, useState } from "react";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { AttachmentHandler } from "src/handler/attachmentsHandler";
import { File } from "lucide-react";
import Select, { MultiValue } from "react-select";
import * as React from "react";
import { getLocal } from '../../i18/messages';
import Modal from "../modal/Modal";
import { generateAttachmentLink } from "src/util/linkGenerator";
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

export default function AttachmentView({ 
	canInsert = false ,
	onClose
}: { 
	canInsert?: boolean,
	onClose: () => void;
}): JSX.Element {
	const app = useObsidianApp();
	const [attachments, setAttachments] = useState<TFile[]>();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [filter, setFilter] = useState(new AttachmentFilter());
	const [onlyOrphan, setOnlyOrphan] = useState(filter.unused);
	const [selectedFile, setSelectedFile] = useState<TFile>();
	const [selectedFileType, setSelectedFileType] = useState<string>("");
	const [selectedFiles, setSelectedFiles] = useState<TFile[]>([]);

	const imageExtensions = [
		"png",
		"jpg",
		"jpeg",
		"gif",
		"svg",
		"webp",
		"bmp"
	];
	const supportPreviewExtensions = [...imageExtensions, 
		// "md",
		// "canvas",
		// "components",
		// "html",
		// "json",
		// "js",
	];
	const pageSizeOptions = [
		{ value: 10, label: "10" },
		{ value: 20, label: "20" },
		{ value: 50, label: "50" },
	];

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

	const listAttachments = useMemo(() => {
		return async () => {
			const attachmentHandler = new AttachmentHandler();
			const attachments = await attachmentHandler.listAttachments(app);
			setAttachments(attachments);
		};
	}, [app]);
	
	const listUnusedAttachments = useMemo(() => {
		return async () => {
			const attachmentHandler = new AttachmentHandler();
			const attachments = await attachmentHandler.listUnusedAttachments(app);
			setAttachments(attachments);
		};
	}, [app]);
	

	useEffect(() => {
		if (onlyOrphan) {
      listUnusedAttachments();
    } else {
      listAttachments();
    }
	}, [onlyOrphan]);

	const filteredAttachments = useMemo(() => {
		if (!attachments) {
			return [];
		}
		console.log(filter);
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

	const Header = ({
		filter,
		setFilter,
		pageSize,
		setPageSize,
		attachmentExtensions,
		onlyOrphan,
		setOnlyOrphan,
	}: {
		filter: AttachmentFilter;
		setFilter: React.Dispatch<React.SetStateAction<AttachmentFilter>>;
		pageSize: number;
		setPageSize: React.Dispatch<React.SetStateAction<number>>;
		attachmentExtensions: string[];
		onlyOrphan: boolean;
		setOnlyOrphan: React.Dispatch<React.SetStateAction<boolean>>;
	}) => {
		const allImageOption = { value: 'AllImages', label: 'Images(All)' };

		return (
			<div className="attachmentsPro--Header">
				<div className="attachmentsPro--HeaderControls">
					<Select
						isMulti
						name="extensions"
						className="basic-multi-select"
						classNamePrefix="select"
						isSearchable={false}
						// @ts-ignore
						value={filter.extension.map((extension) => {return {value: extension, label: extension} as Option;})}
						options={[allImageOption, ...attachmentExtensions.map((extension) => {
							return {
								value: extension,
								label: extension,
							} as Option;
						})]}
						onChange={(newValue: MultiValue<Option>) => {
							setPage(1);
							if (newValue.some(option => option.value === 'AllImages')) {
								setFilter({
									...filter,
									extension: attachmentExtensions.filter(ext => imageExtensions.includes(ext)),
								});
							}else {
								setFilter({
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
							setFilter(prevFilter => ({ ...prevFilter, name: e.target.value }))
						}}
						placeholder="Search by name"
					/>
					<Select
						name="pageSize"
						className="basic-single-select"
						classNamePrefix="select"
						isSearchable={false}
						defaultValue={pageSizeOptions.find((opt) => opt.value === pageSize)}
						options={pageSizeOptions}
						onChange={(selected) => {
							if (selected) {
								setPageSize(selected.value);
								setPage(1);
							}
						}}
					/>
					<label>
						<input
							type="checkbox"
							checked={onlyOrphan}
							onChange={(e) => {
								setPage(1);
								setFilter({ ...filter, unused: e.target.checked });
								setOnlyOrphan(e.target.checked);
							}}
						/>
						Only Unused
					</label>
				</div>
			</div>
	);};

	const PreviewModal = ({
		selectedFile,
		selectedFileType,
		setSelectedFile,
	}: {
		selectedFile: TFile;
		selectedFileType: string;
		setSelectedFile: React.Dispatch<React.SetStateAction<TFile | undefined>>;
	}) => {
		if (!selectedFile) return null;

		const renderPreview = (selectedFile: TFile, selectedFileType: string) => {
			if ( supportPreviewExtensions.includes(selectedFileType)) {
				const filePath = app.vault.adapter.getResourcePath(selectedFile.path);

				if (imageExtensions.includes(selectedFileType)) {
					return (
						<img
							draggable={true}
							src={filePath}
							alt={selectedFile.name}
						/>
					);
				}
			}
			else {
				return (
					<div>can't preview this file type</div>
				)
			}
		};

		return (

			<Modal
				title={selectedFile.name}
				onClose={() => setSelectedFile(undefined)}
				closeOnClickOutside={false}
			>
				<div 
					className="attachmentsPro--ItemModal" 
					onClick={() => setSelectedFile(undefined)}
				>
					{renderPreview(selectedFile, selectedFileType)}
				</div>
			</Modal>
		);
	};
	
	const Content = ({
		attachments,
		supportPreviewExtensions,
		app,
	}: {
		attachments: TFile[];
		supportPreviewExtensions: string[];
		app: App;
	}) => {
		const renderPreview = (attachment: TFile) => {
			if (supportPreviewExtensions.includes(attachment.extension)){
				const filePath = app.vault.adapter.getResourcePath(attachment.path);

				if (imageExtensions.includes(attachment.extension)) {
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
		<>
			<div 
				className="attachmentsPro--Content"
			>
				{attachments.map((attachment) => (
					<div 
						className={`attachmentsPro--Item ${canInsert && selectedFiles.some(f => f.path === attachment.path) ? 'selected' : ''}`}
						key={attachment.path}
					>
						<div 
							className="attachmentsPro--ItemPreview"
							onClick={() => {
								setSelectedFile(attachment);
								setSelectedFileType(attachment.extension);
							}}
						>
							{renderPreview(attachment)}
							{canInsert && (
								<div 
									className={`attachmentsPro--ItemCheckbox ${selectedFiles.some(f => f.path === attachment.path) ? 'selected' : ''}`}
									onClick={(e) => {
										e.stopPropagation();
										handleAttachmentSelect(attachment);
									}}
								>
									{selectedFiles.some(f => f.path === attachment.path) ? '✓' : ''}
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
									app.workspace.openLinkText(attachment.name, attachment.path, true, { active: true });
								}}
							>
								{attachment.name}
							</a>
						</div>
					</div>
				))}
			</div>
		</>
	);};
	
	const Pagination = ({
		page,
		setPage,
		totalPages,
	}: {
		page: number;
		setPage: React.Dispatch<React.SetStateAction<number>>;
		totalPages: number;
	}) => {
		return (
			<div className="attachmentsPro--Pagination">
				<div className="attachmentsPro--PaginationButtons">
					<button 
						onClick={() => setPage((p) => Math.max(1, p - 1))} 
						disabled={page === 1}
					>
						Prev
					</button>
					<span>
						{page} / {totalPages}
					</span>
					<button 
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
						disabled={page === totalPages}
					>
						Next
					</button>
				</div>
				{canInsert && selectedFiles.length > 0 && (
					<div className="attachmentsPro--InsertButton">
						<button onClick={handleInsertAttachments}>
							{getLocal().INSERT_SELECTED_ATTACHMENTS} ({selectedFiles.length})
						</button>
					</div>
				)}
			</div>
		);
	};

	return (
		<>
		<div className="attachmentsPro--ViewContainer">
			{
				Header({
					filter,
					setFilter,
					pageSize,
					setPageSize,
					attachmentExtensions,
					onlyOrphan,
					setOnlyOrphan
				})
			}
			{
				Content({
					attachments: paginatedAttachments,
					supportPreviewExtensions,
					app
				})
			}
			{selectedFile && (
				<PreviewModal
					selectedFile={selectedFile}
					selectedFileType={selectedFileType}
					setSelectedFile={setSelectedFile}
				/>
			)}
			{
				Pagination({
					page,
					setPage,
					totalPages: Math.ceil(filteredAttachments.length / pageSize)
				})
			}
		</div>
		</>
	);
}
