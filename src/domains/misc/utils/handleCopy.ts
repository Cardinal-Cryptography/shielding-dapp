export default async (text: string | undefined, onSuccess?: () => void, onError?: () => void) => {
  if (text === undefined) return;
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch {
    onError?.();
  }
};
