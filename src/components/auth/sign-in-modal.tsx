import {DialogContent} from "@radix-ui/react-dialog";

import {Dialog} from "../ui/dialog";
import SignInFlow from "./sign-in-flow";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignInModal({open, onOpenChange}: SignInModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden border-zinc-500/30 backdrop-blur-lg sm:p-10 dark:bg-black/70 [&>button:last-child]:hidden">
        <SignInFlow />
      </DialogContent>
    </Dialog>
  );
}
