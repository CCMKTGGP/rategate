import ViewLocationClient from ".";

export default async function ViewLocation({
  params,
}: {
  params: {
    locationId: string;
  };
}) {
  const { locationId } = await params;
  return <ViewLocationClient locationId={locationId} />;
}
