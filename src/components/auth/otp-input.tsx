import * as React from "react";

type Props = {
  length?: number;
  value?: string;
  onChange?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  inputClassName?: string;
};

export default function OtpInput({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  autoFocus = true,
  inputClassName = "",
}: Props) {
  const [vals, setVals] = React.useState<string[]>(() => {
    const arr = new Array(length).fill("");
    for (let i = 0; i < Math.min(value.length, length); i++) arr[i] = value[i];
    return arr;
  });

  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    // keep internal state synced when parent updates value
    if (value == null) return;
    const arr = new Array(length).fill("");
    for (let i = 0; i < Math.min(value.length, length); i++) arr[i] = value[i];
    setVals(arr);
  }, [value, length]);

  const notify = React.useCallback(
    (next: string[]) => {
      onChange?.(next.join(""));
    },
    [onChange]
  );

  const focusTo = (index: number) => {
    const ref = refs.current[index];
    if (ref && typeof ref.focus === "function") ref.focus();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const raw = e.target.value || "";
    const ch = raw.replace(/[^0-9]/g, "");
    if (!ch && raw !== "") return; // ignore non-digits

    const next = [...vals];
    next[idx] = ch.charAt(0) || "";
    setVals(next);
    notify(next);

    if (ch.length > 0) {
      // if user pasted multiple digits into one box, distribute
      if (ch.length > 1) {
        const digits = ch.split("");
        for (let i = idx; i < length && digits.length; i++) {
          next[i] = digits.shift() || next[i];
        }
        setVals(next);
        notify(next);
        const lastFilled = Math.min(length - 1, idx + ch.length - 1);
        focusTo(lastFilled + 1 < length ? lastFilled + 1 : lastFilled);
        return;
      }
      // advance
      if (idx + 1 < length) focusTo(idx + 1);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    const key = e.key;
    const target = e.currentTarget;

    if (key === "Backspace") {
      if (target.value === "") {
        // move to previous
        if (idx > 0) {
          const prevRef = refs.current[idx - 1];
          if (prevRef) {
            prevRef.focus();
            // also clear previous value
            const next = [...vals];
            next[idx - 1] = "";
            setVals(next);
            notify(next);
          }
        }
      }
    } else if (key === "ArrowLeft") {
      if (idx > 0) focusTo(idx - 1);
      e.preventDefault();
    } else if (key === "ArrowRight") {
      if (idx + 1 < length) focusTo(idx + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    const paste = e.clipboardData
      .getData("Text")
      .replace(/[^0-9]/g, "")
      .slice(0, length - idx);
    if (!paste) return;
    e.preventDefault();
    const next = [...vals];
    for (let i = 0; i < paste.length; i++) {
      next[idx + i] = paste[i];
    }
    setVals(next);
    notify(next);
    const last = Math.min(length - 1, idx + paste.length - 1);
    focusTo(last + 1 < length ? last + 1 : last);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {new Array(length).fill(null).map((_, i) => (
        <input
          key={i}
          ref={el => {
            refs.current[i] = el;
            return;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={vals[i] || ""}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={e => handlePaste(e, i)}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          className={`w-12 h-12 text-center rounded-md border border-border bg-input text-foreground text-lg ${inputClassName}`}
        />
      ))}
    </div>
  );
}
