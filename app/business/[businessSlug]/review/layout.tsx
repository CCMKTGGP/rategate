import type { Metadata } from "next";

type Params = Promise<{
  businessSlug: string;
}>;

// Fetch business information from API
async function getBusinessInfo(businessSlug: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/business-slug/${businessSlug}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return { name: "Unknown Business" }; // Handle error case
  }

  const { data } = await response.json();

  return data.business;
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { businessSlug } = await params;
  const business = await getBusinessInfo(businessSlug);

  return {
    title: `${business.name}`,
    icons: `${process.env.NEXT_PUBLIC_BASE_URL}/custom-favicon.ico`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
