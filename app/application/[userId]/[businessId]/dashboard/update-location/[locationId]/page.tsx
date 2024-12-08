import EditLocationClient from ".";

export default async function EditLocation({
  params,
}: {
  params: {
    locationId: string;
  };
}) {
  const { locationId } = await params;
  return <EditLocationClient locationId={locationId} />;
}
