import { TFile } from "obsidian";
import { useEffect, useMemo, useState } from "react";
import { useObsidianApp } from "src/context/obsidianAppContext";
import { AttachmentHandler } from "src/handler/attachmentsHandler";
import { File } from "lucide-react";
import Select, { MultiValue } from "react-select";

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
	const [onlyOrphan, setOnlyOrphan] = useState(false);

	const supportPreviewExtensions = [
		"png",
		"jpg",
		"jpeg",
		"gif",
		"svg",
		"webp",
		"canvas",
	];

	const attachmentExtensions = useMemo(() => {
		if (!attachments) {
			return [];
		}
		const distinct = new Set(
			attachments?.map((attachment) => attachment.extension)
		);
		return Array.from(distinct);
	}, [attachments]);

	const listAttachments = async () => {
		const attachmentHandler = new AttachmentHandler();
		const attachments = await attachmentHandler.listAttachments(app);
		setAttachments(attachments);
		return [];
	};

	useEffect(() => {
		listAttachments();
	}, []);

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
				if (filter.extension.length > 0) {
					console.log(filter.extension);
					return filter.extension.includes(attachment.extension);
				}
				return true;
			});
	}, [filter, attachments, onlyOrphan]);

	return (
		<>
			<div className="attachment-view-container">
				<div className="header">
					<Select
						isMulti
						name="extensions"
						className="basic-multi-select"
						classNamePrefix="select"
						// @ts-ignore
						options={attachmentExtensions.map((extension) => {
							return {
								value: extension,
								label: extension,
							} as Option;
						})}
						onChange={(newValue: MultiValue<Option>) => {
							setPage(1);
							setFilter({
								...filter,
								extension: newValue.map((o) => o.value),
							});
						}}
					></Select>

					<input
						type="text"
						defaultValue={filter.name}
						onChange={(e) => {
							setFilter({ ...filter, name: e.target.value });
						}}
					/>
				</div>
				<div className="header">
					<button
						onClick={() => {
							if (page > 1) {
								setPage(page - 1);
							}
						}}
					>
						Prev
					</button>
					<span>
						{page}/{" "}
						{Math.ceil(filteredAttachments.length / pageSize)}
					</span>
					<button
						onClick={() => {
							if (
								page <
								Math.ceil(filteredAttachments.length / pageSize)
							) {
								setPage(page + 1);
							}
						}}
					>
						Next
					</button>
				</div>

				<div className="content">
					{filteredAttachments
						?.slice(
							(page - 1) * pageSize,
							(page - 1) * pageSize + pageSize
						)
						.map((attachment) => {
							return (
								<div
									className="attachment-item"
									key={attachment.path}
								>
									{supportPreviewExtensions.includes(
										attachment.extension
									) ? (
										<div className="item-preview">
											<img
												src={app.vault.adapter.getResourcePath(
													attachment.path
												)}
												alt={attachment.name}
											/>
										</div>
									) : (
										<div className="item-preview">
											<File />
										</div>
									)}

									{/* <div className="item-name">
										{attachment.name}
									</div> */}
									<div className="item-path">
										{attachment.path}
									</div>
								</div>
							);
						})}
				</div>
				<div className="footer"></div>
			</div>
		</>
	);
}

const pageSizeOptions = [
	{
		id: 1,
		label: "10",
		value: 10,
	},
	{
		id: 2,
		label: "20",
		value: 20,
	},
	{
		id: 3,
		label: "50",
		value: 50,
	},
];

type Option = {
	value: string;
	label: string;
};
