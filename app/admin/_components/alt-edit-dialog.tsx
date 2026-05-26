"use client";

import { IconEdit } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { updateImageAlt } from "@/app/actions/images";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AltEditDialogProps {
  imageId: string;
  currentAlt: string | null;
  triggerClassName?: string;
}

export function AltEditDialog({
  imageId,
  currentAlt,
  triggerClassName,
}: AltEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentAlt ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateImageAlt(imageId, value.trim());
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setValue(currentAlt ?? "");
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className={triggerClassName}
            title="Edit alt text"
          />
        }
      >
        <IconEdit className="size-3.5" />
        <span className="sr-only">Edit alt text</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit alt text</DialogTitle>
          <DialogDescription>
            Describe the image for screen readers and SEO. Leave empty for
            purely decorative images.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="alt">Alt text</Label>
          <Textarea
            id="alt"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder="A screenshot of the project's home page on a desktop browser."
            maxLength={300}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
