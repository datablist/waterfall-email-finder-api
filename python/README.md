# Waterfall Email Finder API — Python examples

Find work emails from names and companies using Requests or async HTTPX.
Each standalone file shows all the HTTP calls in one place.

## Setup

Use Python 3.12 or newer. From this `python` folder:

```sh
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
export DATABLIST_API_KEY='your-personal-api-key'
```

Create your key on the [Datablist API page](https://app.datablist.com/account/api).
Calls use credits; see the current
[credit cost and limits](https://platform.datablist.com/docs/enrichments/tools/waterfall-email-finder#credits-and-limits)
and [pricing](https://www.datablist.com/pricing).

## Run an example

**Synchronous, using Requests:**

```sh
python sync_requests.py
```

**Asynchronous, using HTTPX:**

```sh
python async_httpx.py
```

Each file has four examples at the bottom:

1. First and last name + company domain.
2. First and last name + company name.
3. Full name + company name or domain.
4. LinkedIn profile URL.

The first example is active. To try another, comment out the active `settings`
and `people` block, then uncomment the one you want. Edit its sample values.
Each run submits only the selected example.

Both scripts submit a background task, poll every three seconds, and read every
result page. Requests uses blocking calls. HTTPX uses `await` and `asyncio.sleep`.

## Customize the example

Each example defines its own `settings` and `people`. For example, to use a
full name and company name, select this block:

```python
settings = {"sourceKind": "name_company", "useFullName": True}
people = [
    {"fullName": "Satya Nadella", "companyNameOrDomain": "Microsoft"},
]
```

To use a LinkedIn profile URL:

```python
settings = {"sourceKind": "linkedin"}
people = [
    {"linkedInProfile": "https://www.linkedin.com/in/satyanadella/"},
]
```

Use public profile URLs; Sales Navigator URLs are not supported. See the root
README for [complete JSON requests](../README.md#other-input-examples).

For a custom waterfall, edit `settings` as shown in the root README's
[complete output example](../README.md#complete-output-example-with-a-custom-waterfall).
The default workflow does not need provider API keys.

## Results and limits

Each script prints full results, including `inputId`, `status`, `outputs`,
`creditsUsed`, and `error`. Match results to your people through `inputId`.

See [all output fields](../README.md#all-output-fields) for the complete production
output list: `emailFound`, `emailStatus`, `mxProvider`, and the conditional
`finderProvider`.

Each run submits one task of up to 10,000 inputs, within the API's request-size
limits. These examples do not batch larger lists.

## When something fails

HTTP errors raise the library's normal exception. A failed or stopped task
raises an exception with its task ID. A completed task can still have individual
errors or no email found; check each result's `status` and `error`.

If you stop a script, the task continues on the server. List your
[tasks](https://platform.datablist.com/docs/enrichments/tasks) to check its status
before creating another task.
