export default function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h2 className="text-base font-semibold text-text-main">Chat</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-sub">欢迎回来</span>
      </div>
    </header>
  );
}
