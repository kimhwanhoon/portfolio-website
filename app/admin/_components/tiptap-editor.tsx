"use client";

import {
  IconBold,
  IconCode,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconQuote,
} from "@tabler/icons-react";
import { textblockTypeInputRule } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Markdown } from "tiptap-markdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TiptapJSON } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);

export const EMPTY_TIPTAP_DOC: TiptapJSON = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const CodeBlockWithLanguage = CodeBlockLowlight.extend({
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^```([a-zA-Z0-9+-]+)?[\s\n]$/,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1] ?? null,
        }),
      }),
    ];
  },
});

export type TiptapEditorRef = {
  getContent: () => { json: TiptapJSON; html: string };
};

interface AvailableImage {
  id: string;
  url: string;
  alt: string | null;
}

interface TiptapEditorProps {
  initialContent?: TiptapJSON;
  availableImages?: AvailableImage[];
  placeholder?: string;
  onUpdate?: (json: TiptapJSON, html: string) => void;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(active && "bg-muted text-foreground")}
    >
      {children}
    </Button>
  );
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  function TiptapEditor(
    { initialContent, availableImages = [], placeholder, onUpdate },
    ref,
  ) {
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
          heading: { levels: [2, 3] },
          link: false,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        }),
        Image.configure({
          HTMLAttributes: { loading: "lazy", class: "rounded-lg" },
        }),
        CodeBlockWithLanguage.configure({
          lowlight,
          defaultLanguage: null,
          HTMLAttributes: { class: "hljs" },
        }),
        Typography,
        Placeholder.configure({
          placeholder: placeholder ?? "Start writing your post…",
        }),
        Markdown.configure({
          html: false,
          tightLists: true,
          linkify: true,
          breaks: false,
          transformPastedText: true,
          transformCopiedText: false,
        }),
      ],
      content: initialContent ?? EMPTY_TIPTAP_DOC,
      onUpdate: ({ editor: instance }) => {
        onUpdate?.(instance.getJSON() as TiptapJSON, instance.getHTML());
      },
      editorProps: {
        attributes: {
          class:
            "prose prose-sm dark:prose-invert max-w-none min-h-[280px] px-4 py-3 focus:outline-none",
        },
      },
    });

    useImperativeHandle(ref, () => ({
      getContent: () => ({
        json: (editor?.getJSON() ?? EMPTY_TIPTAP_DOC) as TiptapJSON,
        html: editor?.getHTML() ?? "",
      }),
    }));

    if (!editor) return null;

    function setLink() {
      const previous = editor?.getAttributes("link").href as string | undefined;
      const url = window.prompt("URL", previous ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor?.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }

    function insertImage(url: string) {
      editor?.chain().focus().setImage({ src: url }).run();
      setImagePickerOpen(false);
    }

    return (
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
          <ToolbarButton
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <IconBold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <IconItalic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
          >
            <IconH2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
          >
            <IconH3 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <IconList className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Ordered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <IconListNumbers className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            <IconQuote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
          >
            <IconCode className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Link"
            onClick={setLink}
            active={editor.isActive("link")}
          >
            <IconLink className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Image" onClick={() => setImagePickerOpen(true)}>
            <IconPhoto className="size-4" />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />

        <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Insert image</DialogTitle>
            </DialogHeader>
            {availableImages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No images in the library. Upload images in Admin → Images first,
                or paste a URL below.
              </p>
            ) : (
              <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
                {availableImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => insertImage(img.url)}
                    className="relative aspect-square overflow-hidden rounded-md border hover:ring-2 hover:ring-primary"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? ""}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = imageUrlInput.trim();
                    if (value) {
                      insertImage(value);
                      setImageUrlInput("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const value = imageUrlInput.trim();
                  if (value) {
                    insertImage(value);
                    setImageUrlInput("");
                  }
                }}
              >
                Insert URL
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);
