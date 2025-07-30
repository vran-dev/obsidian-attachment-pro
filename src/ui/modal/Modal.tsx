/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import "./Modal.css";

import * as React from "react";
import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function PortalImpl({
	onClose,
	children,
	title,
	closeOnClickOutside,
	modalContentSize = "auto",
}: {
	children: ReactNode;
	closeOnClickOutside: boolean;
	onClose: () => void;
	title: string;
	modalContentSize: "auto" | "max";
}): JSX.Element {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (modalRef.current !== null) {
			modalRef.current.focus();
		}
	}, []);

	useEffect(() => {
		let modalOverlayElement: HTMLElement | null = null;
		const handler = (event: KeyboardEvent): void => {
			if (event.keyCode === 27) {
				onClose();
			}
		};
		const clickOutsideHandler = (event: MouseEvent): void => {
			const target = event.target;
			if (
				modalRef.current !== null &&
				!modalRef.current.contains(target as Node) &&
				closeOnClickOutside
			) {
				onClose();
			}
		};
		const modelElement = modalRef.current;
		if (modelElement !== null) {
			modalOverlayElement = modelElement.parentElement;
			if (modalOverlayElement !== null) {
				modalOverlayElement.addEventListener(
					"click",
					clickOutsideHandler
				);
			}
		}

		window.addEventListener("keydown", handler);

		return () => {
			window.removeEventListener("keydown", handler);
			if (modalOverlayElement !== null) {
				modalOverlayElement?.removeEventListener(
					"click",
					clickOutsideHandler
				);
			}
		};
	}, [closeOnClickOutside, onClose]);

	let modalContentStyle;
	if (modalContentSize === "max") {
		modalContentStyle = {
			flexGrow: 1,
		};
	} else {
		modalContentStyle = {};
	}
	return (
		<div className="Modal__overlay" role="dialog">
			<div
				className="Modal__modal"
				tabIndex={-1}
				ref={modalRef}
				style={{ ...modalContentStyle }}
			>
				<h2 className="Modal__title">{title}</h2>
				<button
					className="Modal__closeButton"
					aria-label="Close modal"
					type="button"
					onClick={onClose}
				>
					X
				</button>
				<div className="Modal__content">{children}</div>
			</div>
		</div>
	);
}

export default function Modal({
	onClose,
	children,
	title,
	closeOnClickOutside = false,
	modalContentSize,
	container,
}: {
	children: ReactNode;
	closeOnClickOutside?: boolean;
	onClose: () => void;
	title: string;
	modalContentSize?: "auto" | "max";
	container?: HTMLElement;
}): JSX.Element {
	// 如果提供了容器，使用 createPortal 渲染到该容器
	// 否则直接返回组件（不使用 Portal）
	if (container) {
		return createPortal(
			<PortalImpl
				onClose={onClose}
				title={title}
				closeOnClickOutside={closeOnClickOutside}
				modalContentSize={modalContentSize ? modalContentSize : "auto"}
			>
				{children}
			</PortalImpl>,
			container
		);
	}

	// 不使用 Portal，直接渲染组件
	return (
		<PortalImpl
			onClose={onClose}
			title={title}
			closeOnClickOutside={closeOnClickOutside}
			modalContentSize={modalContentSize ? modalContentSize : "auto"}
		>
			{children}
		</PortalImpl>
	);
}
