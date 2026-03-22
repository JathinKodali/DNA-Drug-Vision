const API_BASE_URL = "http://localhost:8000";

export interface CellLineInfo {
    model_id: string;
    name: string;
    disease: string;
}

export const fetchCellLines = async (): Promise<CellLineInfo[]> => {
    const response = await fetch(`${API_BASE_URL}/cell_lines`);
    if (!response.ok) throw new Error("Failed to fetch cell lines");
    const data = await response.json();
    return data.cell_lines;
};

export const predictCellLine = async (modelId: string) => {
    const response = await fetch(`${API_BASE_URL}/predict/cellline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: modelId }),
    });
    if (!response.ok) throw new Error("Failed to predict cell line");
    return response.json();
};

export const predictDNA = async (dnaSequence: string) => {
    const response = await fetch(`${API_BASE_URL}/predict/dna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna_sequence: dnaSequence }),
    });
    if (!response.ok) throw new Error("Failed to predict DNA sequence");
    return response.json();
};
