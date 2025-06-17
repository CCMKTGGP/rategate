export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/); // splits by any whitespace

  if (parts.length === 1) {
    return { first_name: parts[0], last_name: "" };
  }

  const last_name = parts.pop(); // get last element
  const first_name = parts.join(" "); // join the rest

  return { first_name, last_name };
}
