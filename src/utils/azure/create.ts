import { campaignToAzure } from "~/data/mappers";

export async function createAzureTicket(data: ReturnType<typeof campaignToAzure>) {
    const response = await fetch(
        "https://prod-191.westeurope.logic.azure.com:443/workflows/12a53402b7734e8aa8f009badd276dac/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fLE_9qQrZ-BOb6U8TulAUcqrUNKl99cS83oJBkwS2os",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-data-token": import.meta.env.VITE_HEADERS_TOKEN,
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        return { data: null, error: `Request failed with status ${response.status}` };
    }

    const res = await response.json();
    return { data: res, error: null }
}