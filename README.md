# Waterfall Email Finder API

Find work email addresses from a person's name and company, or their LinkedIn
profile URL, with the [Datablist](https://www.datablist.com/) Waterfall Email
Finder API. A waterfall tries several lookup services to find an email.

Use it to fill missing work emails in CRM contacts, build prospecting workflows,
or add email lookup to your application. Results include the email address,
deliverability status, and mail provider when available.

## Cost

**25 credits per work email found** with the default waterfall.

**No result, no charge.** If no work email is found, the lookup costs **0 credits**.

If you use your own provider keys, provider usage is billed separately.

Costs are in Datablist credits. Each result reports its actual `creditsUsed`.
See the [API cost and limits](https://platform.datablist.com/docs/enrichments/tools/waterfall-email-finder#credits-and-limits)
and [credit pack pricing](https://www.datablist.com/pricing) for current rates.

## Get started

Choose [Python](python/README.md) or [TypeScript](typescript/README.md).
Create a [Personal API Key](https://app.datablist.com/account/api), then run an
example from the repository root.

**Python:**

```sh
cd python
python -m pip install -r requirements.txt
export DATABLIST_API_KEY='your-personal-api-key'
python sync_requests.py
```

**TypeScript:**

```sh
export DATABLIST_API_KEY='your-personal-api-key'
npx tsx typescript/example.ts
```

With Node.js 24.3 or newer, you can also run `node typescript/example.ts` directly.
Run each command block from the repository root.

## Input and output

Send names and company domains or names to
`POST https://api.datablist.com/v1/enrichments/tasks`, with your key in the
`X-API-Key` header:

```json
{
  "enrichmentId": "waterfall-email-finder",
  "uniqueId": "waterfall-email-finder-example-001",
  "settings": {
    "sourceKind": "name_company"
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "firstName": "Jane",
        "lastName": "Doe",
        "companyNameOrDomain": "example.com"
      }
    }
  ]
}
```

A company domain is usually more precise than a company name. Use a new
`uniqueId` for each new task. Give each person their own `inputId` so you can
match results to your records, including when names repeat.

The API returns `202 Accepted` with a task ID in `@id`. Check its status, then
retrieve the results. Here is a default-workflow response (sample data):

```json
{
  "taskId": "00000000000040008000000000000001",
  "results": [
    {
      "inputId": "row-1",
      "status": "success",
      "outputs": {
        "emailFound": "jane.doe@example.com",
        "emailStatus": "verified",
        "mxProvider": "google"
      },
      "creditsUsed": "25",
      "error": null
    }
  ],
  "nextCursor": null
}
```

The scripts print complete result objects. A completed task can contain rows
without an email; check each result's `status`, `outputs`, and `error`.

## All output fields

The [production schema](https://api.datablist.com/v1/enrichments/waterfall-email-finder)
defines these four output fields:

| Field | Meaning |
| --- | --- |
| `emailFound` | The work email address found. |
| `emailStatus` | Deliverability information such as `verified` or `unverified`; also reports `not_found`, `missing_source_data`, or `invalid_data`. |
| `mxProvider` | The email hosting provider, such as `google` or `microsoft`. |
| `finderProvider` | The lookup service that found the email. Available for name-and-company lookups with `useCustomAPIKeys: true`. |

### Complete output example with a custom waterfall

To include `finderProvider`, use your own provider key and replace the request's
`settings` with the following. The default examples do not need a provider key.

```json
{
  "sourceKind": "name_company",
  "useCustomAPIKeys": true,
  "customSequence": [
    {
      "provider": "icypeas",
      "apiKey": "your-provider-api-key"
    }
  ]
}
```

This response shows **every production output field**, including the conditional
provider field (sample data and credit amount):

```json
{
  "taskId": "00000000000040008000000000000002",
  "results": [
    {
      "inputId": "row-1",
      "status": "success",
      "outputs": {
        "emailFound": "jane.doe@example.com",
        "emailStatus": "verified",
        "mxProvider": "google",
        "finderProvider": "icypeas"
      },
      "creditsUsed": "0",
      "error": null
    }
  ],
  "nextCursor": null
}
```

Custom provider usage and Datablist credits are separate. Read `creditsUsed` for
the Datablist amount charged.

## Other input examples

The request above uses a first name, last name, and company domain. Here are
complete requests for the other input options. All three scripts include these
examples at the bottom; select one block before running.

### First and last name + company name

Use the same `companyNameOrDomain` field with a company name:

```json
{
  "enrichmentId": "waterfall-email-finder",
  "uniqueId": "waterfall-email-finder-company-name-001",
  "settings": {
    "sourceKind": "name_company"
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "firstName": "Satya",
        "lastName": "Nadella",
        "companyNameOrDomain": "Microsoft"
      }
    }
  ]
}
```

### Full name + company name or domain

Enable `useFullName` and send `fullName` instead of separate first and last names.
This example uses a company name; `"microsoft.com"` also works:

```json
{
  "enrichmentId": "waterfall-email-finder",
  "uniqueId": "waterfall-email-finder-full-name-001",
  "settings": {
    "sourceKind": "name_company",
    "useFullName": true
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "fullName": "Satya Nadella",
        "companyNameOrDomain": "Microsoft"
      }
    }
  ]
}
```

### LinkedIn profile URL

Set `sourceKind` to `"linkedin"` and send `linkedInProfile`. No name or company
fields are needed:

```json
{
  "enrichmentId": "waterfall-email-finder",
  "uniqueId": "waterfall-email-finder-linkedin-001",
  "settings": {
    "sourceKind": "linkedin"
  },
  "inputs": [
    {
      "inputId": "row-1",
      "data": {
        "linkedInProfile": "https://www.linkedin.com/in/satyanadella/"
      }
    }
  ]
}
```

Use public LinkedIn profile URLs. Sales Navigator URLs are not supported.
Each task uses one input mode; keep its settings and input fields consistent.
See the [API settings](https://platform.datablist.com/docs/enrichments/tools/waterfall-email-finder#settings)
for custom provider choices.

## Try with cURL

Set your key, then submit a person:

```sh
export DATABLIST_API_KEY='your-personal-api-key'

curl --request POST 'https://api.datablist.com/v1/enrichments/tasks' \
  --header "X-API-Key: $DATABLIST_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "enrichmentId": "waterfall-email-finder",
    "uniqueId": "waterfall-email-finder-curl-001",
    "settings": {"sourceKind": "name_company"},
    "inputs": [
      {"inputId": "row-1", "data": {"firstName": "Jane", "lastName": "Doe", "companyNameOrDomain": "example.com"}}
    ]
  }'
```

Copy the returned `@id` into `TASK_ID`. Use a new `uniqueId` for a new task.

```sh
TASK_ID='paste-returned-task-id'

curl "https://api.datablist.com/v1/enrichments/tasks/$TASK_ID" \
  --header "X-API-Key: $DATABLIST_API_KEY"
```

Repeat the status command every few seconds until `status` is `completed`,
`failed`, or `stopped`. Then retrieve the results:

```sh
curl "https://api.datablist.com/v1/enrichments/tasks/$TASK_ID/results" \
  --header "X-API-Key: $DATABLIST_API_KEY"
```

If `nextCursor` is not `null`, pass it as `cursor` to fetch the next page.
The Python and TypeScript examples read every page for you.

## Code examples

| Example | What it shows |
| --- | --- |
| [Synchronous Requests](python/sync_requests.py) | Find work emails using blocking HTTP calls. |
| [Asynchronous HTTPX](python/async_httpx.py) | Use `async` and `await` for the same API workflow. |
| [TypeScript](typescript/example.ts) | Use async/await, built-in `fetch`, and no imports. |

Each script is self-contained: submit people, wait for the background task, and
read the results. Both Python clients use asynchronous backend tasks; Requests
blocks while HTTPX uses `await`. Each run submits one task of up to 10,000 inputs,
within the API's request-size limits. These examples do not batch larger lists.

## Documentation

- [Waterfall Email Finder API](https://platform.datablist.com/docs/enrichments/tools/waterfall-email-finder)
- [Enrichments API quickstart](https://platform.datablist.com/docs/enrichments/quickstart)
- [Task lifecycle](https://platform.datablist.com/docs/enrichments/tasks)

## Other Datablist API examples

- [Company Name to Domain API](https://github.com/datablist/company-name-to-domain-api): find company websites from names.
- [Company Name Cleaner API](https://github.com/datablist/company-name-cleaner-api): clean and standardize company names.
- [Company to LinkedIn API](https://github.com/datablist/company-to-linkedin-api): find LinkedIn company pages from websites, or websites from LinkedIn company pages.
- [LinkedIn Profile Finder API](https://github.com/datablist/linkedin-profile-finder-api): find profiles from names and company keywords.
- [LinkedIn Profile Scraper API](https://github.com/datablist/linkedin-profile-scraper-api): retrieve profile, employment, and education details from LinkedIn URLs.
- [LinkedIn Company Scraper API](https://github.com/datablist/linkedin-company-scraper-api): retrieve company details from LinkedIn company pages.
- [Impressum Scraper API](https://github.com/datablist/impressum-scraper-api): extract business details from website Impressum pages.
- [Waterfall Phone Finder API](https://github.com/datablist/waterfall-phone-finder-api): find phone numbers from LinkedIn profile URLs.
- [Waterfall Personal Email Finder API](https://github.com/datablist/waterfall-personal-email-finder-api): find personal email addresses from LinkedIn profile URLs.
