import { TextFileView, TFile } from "obsidian";

declare module "obsidian" {
  interface CanvasView extends TextFileView {
    handlePaste: (e: ClipboardEvent) => Promise<void>;
    /** Obsidian 未公开的 Canvas 内部对象，仅声明本插件用到的成员 */
    canvas: {
      posCenter(): { x: number; y: number };
      createFileNode(options: {
        pos: { x: number; y: number };
        position: string;
        file: TFile;
      }): unknown;
    };
  }
}