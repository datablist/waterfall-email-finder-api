"""Find work emails from names and companies with the Datablist API using async HTTPX.

This standalone example submits a small list of people, waits for the background
task to finish, and reads all pages of results.
HTTP calls use await, and polling pauses use asyncio.sleep.

Choose an example at the bottom: names and company domains, names and company
names, full names, or LinkedIn profile URLs. Each example includes its settings
and input fields. Only the selected example is submitted when you run the file.
Results include the email address, deliverability status, and mail provider when
available. Complete result objects are printed, including credits and errors.

Set DATABLIST_API_KEY and run: python async_httpx.py
This example submits one task of up to 10,000 inputs. Calls use account credits.
"""

import asyncio
import os
import uuid

import httpx


async def find_emails(people: list[dict], api_key: str, settings: dict) -> list[dict]:
    """Submit one task, wait for it to finish, and return its results."""
    tasks_url = "https://api.datablist.com/v1/enrichments/tasks"
    headers = {"X-API-Key": api_key}
    inputs = [
        {"inputId": f"row-{index}", "data": person}
        for index, person in enumerate(people, start=1)
    ]

    async with httpx.AsyncClient() as client:
        # 1. Submit the people to look up.
        payload = {
            "enrichmentId": "waterfall-email-finder",
            "uniqueId": str(uuid.uuid4()),
            "settings": settings,
            "inputs": inputs,
        }
        response = await client.post(tasks_url, headers=headers, json=payload)
        response.raise_for_status()
        task = response.json()
        task_id = task["@id"]
        task_url = f"{tasks_url}/{task_id}"

        # 2. Wait for the background task to finish.
        while task["status"] not in ("completed", "failed", "stopped"):
            await asyncio.sleep(3)
            response = await client.get(task_url, headers=headers)
            response.raise_for_status()
            task = response.json()

        if task["status"] != "completed":
            raise RuntimeError(f"Task {task_id} {task['status']}: {task.get('error')}")

        # 3. Read the results, following pagination when needed.
        results = []
        results_url = f"{task_url}/results"
        params = {"limit": 100}
        while True:
            response = await client.get(
                results_url, headers=headers, params=params
            )
            response.raise_for_status()
            page = response.json()
            results.extend(page["results"])
            next_cursor = page["nextCursor"]
            if next_cursor is None:
                break
            params["cursor"] = next_cursor

    return results


async def main() -> None:
    api_key = os.environ["DATABLIST_API_KEY"]
    # Choose one example below. Leave the other examples commented out.

    # 1. First and last name + company domain.
    settings = {"sourceKind": "name_company"}
    people = [
        {"firstName": "Satya", "lastName": "Nadella", "companyNameOrDomain": "microsoft.com"},
        {"firstName": "Reid", "lastName": "Hoffman", "companyNameOrDomain": "greylock.com"},
    ]

    # 2. First and last name + company name.
    # settings = {"sourceKind": "name_company"}
    # people = [
    #     {"firstName": "Satya", "lastName": "Nadella", "companyNameOrDomain": "Microsoft"},
    # ]

    # 3. Full name + company name (a domain also works).
    # settings = {"sourceKind": "name_company", "useFullName": True}
    # people = [
    #     {"fullName": "Satya Nadella", "companyNameOrDomain": "Microsoft"},
    # ]

    # 4. LinkedIn profile URL.
    # settings = {"sourceKind": "linkedin"}
    # people = [
    #     {"linkedInProfile": "https://www.linkedin.com/in/satyanadella/"},
    # ]

    results = await find_emails(people, api_key, settings)
    for result in results:
        print(result)


if __name__ == "__main__":
    asyncio.run(main())
