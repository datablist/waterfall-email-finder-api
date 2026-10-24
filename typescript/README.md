# Waterfall Email Finder API — TypeScript example

Find work emails with async/await and built-in `fetch`.
All HTTP calls are in [one standalone file](example.ts).

## Setup and run

From the repository root:

```sh
export DATABLIST_API_KEY='your-personal-api-key'
npx tsx typescript/example.ts
```

With Node.js 24.3 or newer, no runner package is needed:

```sh
node typescript/example.ts
```

From this `typescript` folder, use `npx tsx example.ts` or `node example.ts`.
Create your key on the [Datablist API page](https://app.datablist.com/account/api).
Calls use credits; see the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/waterfall-email-finder#credits-and-limits)
and [pricing](https://www.datablist.com/pricing).

## Customize the example

The file has four examples at the bottom:

1. First and last name + company domain.
2. First and last name + company name.
3. Full name + company name or domain.
4. LinkedIn profile URL.

The first example is active. To try another, comment out the active `settings`
and `people` block, then uncomment the one you want. Edit its sample values.
Each run submits only the selected example.

For example, to use a full name and company name, select this block:

```typescript
const settings = { sourceKind: "name_company", useFullName: true };
const people: Person[] = [
  { fullName: "Satya Nadella", companyNameOrDomain: "Microsoft" },
];
```

To use a LinkedIn profile URL:

```typescript
const settings = { sourceKind: "linkedin" };
const people: Person[] = [
  { linkedInProfile: "https://www.linkedin.com/in/satyanadella/" },
];
```

Use public profile URLs; Sales Navigator URLs are not supported. See the root
README for [complete JSON requests](../README.md#other-input-examples).

For a custom waterfall, edit `settings` as shown in the root README's
[complete output example](../README.md#complete-output-example-with-a-custom-waterfall).
The default workflow does not need provider API keys.

## How it works

The script submits one task, polls every three seconds, and reads result pages
until `nextCursor` is `null`. It uses `fetch`, `crypto.randomUUID()`, and
`setTimeout`, with no imports. The example reads your key from the environment.

Each person gets their own `inputId`, including repeated names. Full results
are printed as JSON, including statuses, outputs, credits used, and errors.
See [all output fields](../README.md#all-output-fields) for `emailFound`,
`emailStatus`, `mxProvider`, and the conditional `finderProvider`.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. This example does not batch larger lists.

## When something fails

HTTP errors and network failures stop the script. A failed or stopped task
throws an error with its task ID. A completed task can still have individual
errors or no email found; check each result's `status` and `error`.

If you stop the script, the task continues on the server. List your
[tasks](https://platform.datablist.com/docs/enrichments/tasks) to check its status
before creating another task.
