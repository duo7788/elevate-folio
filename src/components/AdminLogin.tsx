import { FormEvent, useState } from "react";
import { KeyRound, X } from "lucide-react";

export default function AdminLogin({
  onSubmit,
  onClose,
}: {
  onSubmit: (password: string) => boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (onSubmit(password)) {
      setPassword("");
      setIsError(false);
      return;
    }

    setIsError(true);
    setPassword("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-6 pt-24 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-950/90 p-5 text-white shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Admin Access</h2>
              <p className="text-xs text-neutral-400">Enter your admin password.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close admin login"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setIsError(false);
          }}
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-600 focus:border-white/30"
          placeholder="Password"
          autoFocus
        />

        {isError && (
          <p className="mb-3 text-xs font-medium text-red-400">Incorrect password.</p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
        >
          Unlock Editing
        </button>
      </form>
    </div>
  );
}
