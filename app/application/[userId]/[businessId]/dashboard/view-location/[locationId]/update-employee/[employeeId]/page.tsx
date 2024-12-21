import EditEmployeeClient from ".";

export default async function EditEmployee({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  return <EditEmployeeClient employeeId={employeeId} />;
}
