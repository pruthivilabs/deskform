import { color, radius, space } from "@deskform/tokens";
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  type PublicInstance,
} from "@gpuix/react";
import { useRef } from "react";
import { Button } from "./button";
import { Row } from "./layout";
import { Text } from "./text";

export interface ConfirmDialogProps {
  testId?: string;
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  testId = "confirm-dialog",
  open,
  title,
  description,
  confirmLabel,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const cancel = useRef<PublicInstance>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop style={{ backgroundColor: "#00000099" }} />
        <DialogPopup
          aria-label={title}
          onKeyDown={(event) => {
            if (event.key !== "escape") event.stopPropagation();
          }}
          initialFocus={cancel}
          style={{
            width: 420,
            maxWidth: "90%",
            padding: space.xl,
            gap: space.lg,
            borderRadius: radius.lg,
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor: color.border,
          }}
        >
          <DialogTitle>
            <Text size="heading">{title}</Text>
          </DialogTitle>
          <DialogDescription>
            <Text tone="muted">{description}</Text>
          </DialogDescription>
          <Row style={{ justifyContent: "flex-end", marginTop: space.sm }}>
            <Button ref={cancel} testId={`${testId}-cancel`} onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button testId={`${testId}-confirm`} variant="danger" onPress={onConfirm}>
              {confirmLabel}
            </Button>
          </Row>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
