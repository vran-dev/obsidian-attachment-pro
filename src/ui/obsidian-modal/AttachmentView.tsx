import { App, TFile } from "obsidian";
import { useEffect, useMemo, useState } from "react";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { AttachmentHandler } from "src/handler/attachmentsHandler";
import { File } from "lucide-react";
import Select, { MultiValue } from "react-select";
import * as React from "react";

type Option = {
	value: string;
	label: string;
};

class AttachmentFilter {
	name = "";
	extension: string[] = [];
	unused = false;
}

export default function AttachmentView(): JSX.Element {
	const app = useObsidianApp();
	const [attachments, setAttachments] = useState<TFile[]>();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [filter, setFilter] = useState(new AttachmentFilter());
	const [onlyOrphan, setOnlyOrphan] = useState(filter.unused);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [selectedFileType, setSelectedFileType] = useState<string | null>(null);

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
		"canvas",
		"html",
	];
	const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
  ];

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
			<div className="header">
				<Select
					isMulti
					name="extensions"
					className="basic-multi-select"
					classNamePrefix="select"
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
	);};

	const Modal = ({
		selectedFile,
		selectedFileType,
		setSelectedFile,
	}: {
		selectedFile: string | null;
		selectedFileType: string | null;
		setSelectedFile: React.Dispatch<React.SetStateAction<string | null>>;
	}) => {
		if (!selectedFile) return null;

		return (
			<div className="item-modal" onClick={() => setSelectedFile(null)}>
				<div className="item-modal-content">
					{selectedFileType && imageExtensions.includes(selectedFileType)
					? 
					(
						<img src={selectedFile} alt="Preview" />
					) 
					// : 
					// selectedFileType === "html" ? (
					// 	<iframe
					// 		src={selectedFile}
					// 		title="Preview"
					// 		sandbox="allow-same-origin allow-scripts"
					// 		style={{ width: "100%", height: "500px", border: "none" }}
					// 	/>
					// ) 
					: 
					(
						<div>can't preview this file type</div>
					)
					}
				</div>
			</div>
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
				// else if (attachment.extension === "html") {
				// 	return (
				// 		<iframe
				// 			src={filePath.replace(/^app:\/\/[a-z0-9]+\/?/i, "")}
				// 			title={attachment.name}
				// 			sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
				// 			style={{ width: "100%", height: "500px", border: "none" }}
				// 		/>
				// 	);
				// }
			}
			return <File />;
		};

		return (
		<>
			<div className="content">
				{attachments.map((attachment) => (
					<div className="attachment-item" key={attachment.path}>
						<div 
							className="item-preview"
							onClick={() => {
								setSelectedFile(app.vault.adapter.getResourcePath(attachment.path));
								setSelectedFileType(attachment.extension);
							}}
						>
							{renderPreview(attachment)}
						</div>
						<div className="item-name">
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
	}) => (
		<div className="pagination">
			<button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
				Prev
			</button>
			<span>
				{page} / {totalPages}
			</span>
			<button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
				Next
			</button>
		</div>
	);

	return (
		<>
		<div className="attachment-view-container">
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
				Pagination({
					page,
					setPage,
					totalPages: Math.ceil(filteredAttachments.length / pageSize)
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
				Modal({
					selectedFile,
					selectedFileType,
					setSelectedFile,
				})
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
