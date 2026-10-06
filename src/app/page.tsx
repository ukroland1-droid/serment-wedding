import ChatUI from "@/components/ChatUI";

export default function Home() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col bg-white sm:border-x sm:border-stone-200 sm:shadow-xl">
      <ChatUI />
    </main>
  );
}
