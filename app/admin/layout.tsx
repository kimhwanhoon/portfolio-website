import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen">
        <AdminNav />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
