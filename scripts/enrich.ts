/**
 * Fetches additional data for a chemical from the PubChem API.
 * @param name The name of the ingredient.
 * @returns An object containing the CAS number, CID, and description.
 */
export async function fetchPubChemData(name: string): Promise<PubChemData> {
  try {
    // 1) Get the CID for the compound
    const cidRes = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`,
    );
    if (!cidRes.ok) {
      console.warn(
        `PubChem CID lookup failed for "${name}" with status: ${cidRes.status}`,
      );
      return {};
    }
    const cidData = await cidRes.json();
    const cid = cidData.IdentifierList?.CID?.[0];
    if (!cid) {
      console.warn(`No PubChem CID found for "${name}".`);
      return {};
    }

    // 2) Fetch synonyms (to extract a CAS number)
    const synRes = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`,
    );
    const synData = await synRes.json();
    const allSyns: string[] =
      synData.InformationList.Information[0].Synonym || [];
    const cas_number = allSyns.find((s) => /^\d{2,7}-\d{2}-\d$/.test(s)); // simple CAS regex

    // 3) Fetch a description
    const descRes = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/description/JSON`,
    );
    const descData = await descRes.json();
    const scientific_description =
      descData.InformationList.Information[0].Description;

    console.log(`-> Successfully fetched data for "${name}" (CID: ${cid})`);
    return { cas_number, pubchem_cid: cid, scientific_description };
  } catch (error) {
    console.error(`Error fetching PubChem data for "${name}":`, error);
    return {}; // Return empty object on error to not crash the main script
  }
}

// A toy risk‐level rule: “High” if banned anywhere in your regulations table
export function inferRiskLevel(
  totalAppearances: number,
  isBanned: boolean,
): string {
  if (isBanned) return "Banned";
  if (totalAppearances >= 10) return "High";
  if (totalAppearances >= 3) return "Moderate";
  return "Low";
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
