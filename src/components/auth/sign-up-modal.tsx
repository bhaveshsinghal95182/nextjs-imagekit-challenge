import {Dialog, DialogContent} from "../ui/dialog";
import SignUpFlow from "./sign-up-flow";

export default function SignUpModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden border-zinc-500/30 backdrop-blur-lg sm:p-10 dark:bg-black/70 [&>button:last-child]:hidden">
        <SignUpFlow />
      </DialogContent>
    </Dialog>
  );
}
