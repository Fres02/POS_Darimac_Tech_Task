export function AppFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} LankaPOS. All rights reserved.</p>
        <p>Built for Sri Lankan retail &middot; LKR &middot; Asia/Colombo</p>
      </div>
    </footer>
  );
}
