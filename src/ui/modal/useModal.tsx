/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo, useState } from "react";
import Modal from "./Modal";

export default function useModal(
	afterClose?: () => void,
	modalContentSize?: "auto" | "max"
): [
	JSX.Element | null,
	(title: string, showModal: (onClose: () => void) => JSX.Element) => void
] {
	const [modalContent, setModalContent] = useState<null | {
		closeOnClickOutside: boolean;
		content: JSX.Element;
		title: string;
	}>(null);

	const onClose = useCallback(() => {
		setModalContent(null);
		if (afterClose) {
			afterClose();
		}
	}, []);

	const modal = useMemo(() => {
		if (modalContent === null) {
			return null;
		}
		const { title, content, closeOnClickOutside } = modalContent;
		return (
			<Modal
				onClose={onClose}
				title={title}
				closeOnClickOutside={closeOnClickOutside}
				modalContentSize={modalContentSize}
			>
				{content}
			</Modal>
		);
	}, [modalContent, onClose]);

	const showModal = useCallback(
		(
			title: string,
			// eslint-disable-next-line no-shadow
			getContent: (onClose: () => void) => JSX.Element,
			closeOnClickOutside = false
		) => {
			setModalContent({
				closeOnClickOutside,
				content: getContent(onClose),
				title,
			});
		},
		[onClose]
	);

	return [modal, showModal];
}
