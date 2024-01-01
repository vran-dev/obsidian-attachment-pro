export function FileFolderScopeForm(props: {
	value: string;
	onChange: (path: string) => void;
}): JSX.Element {
	return (
		<>
			<div className="form-item">
				<div className="form-label">文件夹</div>
				<div className="form-content">
					<input
						type="text"
						defaultValue={props.value}
						onChange={(e) => props.onChange(e.target.value)}
					/>
				</div>
			</div>
		</>
	);
}
