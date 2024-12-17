import AddEmployeeClient from ".";

export default async function AddEmployee({
  params,
}: {
  params: {
    locationId: string;
  };
}) {
  const { locationId } = await params;
  return <AddEmployeeClient locationId={locationId} />;
}
