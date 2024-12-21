import EditLocationClient from ".";

export default async function EditLocation({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  return <EditLocationClient locationId={locationId} />;
}
