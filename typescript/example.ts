/**
 * Find work emails from names and companies with async/await and built-in fetch.
 *
 * Submit a small list of people, wait for the background task, and read every
 * result page. Polling pauses for three seconds between status checks.
 *
 * Set DATABLIST_API_KEY, then run from the repository root:
 * npx tsx typescript/example.ts
 * Or with Node.js 24.3 or newer: node typescript/example.ts
 *
 * Choose an example at the bottom: names and company domains, names and company
 * names, full names, or LinkedIn profile URLs. Each includes settings and inputs.
 * Only the selected example is submitted when you run the file.
 * One task accepts up to 10,000 inputs. Calls use account credits.
 * Complete result objects are printed as JSON, including credits and errors.
 */

type Person = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  companyNameOrDomain?: string;
  linkedInProfile?: string;
};

/** Submit one task, wait for it to finish, and return its results. */
async function findEmails(
  people: Person[],
  apiKey: string,
  settings: object,
): Promise<object[]> {
  const tasksUrl = "https://api.datablist.com/v1/enrichments/tasks";
  const headers = {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };
  const inputs = people.map((person, index) => {
    return {
      inputId: `row-${index + 1}`,
      data: person,
    };
  });

  // 1. Submit the inputs.
  const payload = {
    enrichmentId: "waterfall-email-finder",
    uniqueId: crypto.randomUUID(),
    settings,
    inputs,
  };
  let response = await fetch(tasksUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  let task = await response.json();
  const taskId = task["@id"];
  const taskUrl = `${tasksUrl}/${taskId}`;

  // 2. Wait for the background task to finish.
  while (!["completed", "failed", "stopped"].includes(task.status)) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 3000);
    });
    response = await fetch(taskUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    task = await response.json();
  }

  if (task.status !== "completed") {
    throw new Error(`Task ${taskId} ${task.status}`);
  }

  // 3. Read every result page, until nextCursor is null.
  const results: object[] = [];
  const params = new URLSearchParams({ limit: "100" });
  while (true) {
    response = await fetch(`${taskUrl}/results?${params}`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const page = await response.json();
    results.push(...page.results);
    if (page.nextCursor === null) {
      break;
    }
    params.set("cursor", page.nextCursor);
  }

  return results;
}

const apiKey = process.env.DATABLIST_API_KEY ?? "";
// Choose one example below. Leave the other examples commented out.

// 1. First and last name + company domain.
const settings = { sourceKind: "name_company" };
const people: Person[] = [
  { firstName: "Satya", lastName: "Nadella", companyNameOrDomain: "microsoft.com" },
  { firstName: "Reid", lastName: "Hoffman", companyNameOrDomain: "greylock.com" },
];

// 2. First and last name + company name.
// const settings = { sourceKind: "name_company" };
// const people: Person[] = [
//   { firstName: "Satya", lastName: "Nadella", companyNameOrDomain: "Microsoft" },
// ];

// 3. Full name + company name (a domain also works).
// const settings = { sourceKind: "name_company", useFullName: true };
// const people: Person[] = [
//   { fullName: "Satya Nadella", companyNameOrDomain: "Microsoft" },
// ];

// 4. LinkedIn profile URL.
// const settings = { sourceKind: "linkedin" };
// const people: Person[] = [
//   { linkedInProfile: "https://www.linkedin.com/in/satyanadella/" },
// ];

const results = await findEmails(people, apiKey, settings);
console.log(JSON.stringify(results, null, 2));
