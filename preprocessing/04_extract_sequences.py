from Bio import SeqIO
import pandas as pd

# Load reference genome
genome = SeqIO.to_dict(
    SeqIO.parse("data/reference/hg38.fa", "fasta")
)

# Load mutations
mut = pd.read_csv("data/raw/ccle/OmicsSomaticMutations.csv")

print("Mutation columns:", mut.columns.tolist())

# Auto-detect correct column names
chrom_col = [c for c in mut.columns if "CHR" in c.upper()][0]
pos_col   = [c for c in mut.columns if "POS" in c.upper()][0]

print("Using columns:", chrom_col, pos_col)

WINDOW = 25

def get_sequence(row):
    chrom = str(row[chrom_col])

    # Ensure chromosome format matches FASTA (chr1, chr2, ...)
    if not chrom.startswith("chr"):
        chrom = "chr" + chrom

    pos = int(row[pos_col])

    if chrom not in genome:
        return None

    seq = genome[chrom].seq
    start = max(0, pos - WINDOW - 1)
    end = pos + WINDOW

    return str(seq[start:end])

mut["dna_seq"] = mut.apply(get_sequence, axis=1)
mut = mut.dropna(subset=["dna_seq"])

# Enforce fixed length
EXPECTED_LEN = 51
mut = mut[mut["dna_seq"].str.len() == EXPECTED_LEN]
mut = mut[~mut["dna_seq"].str.contains("N")]

# Save for next step
# Save sequences using ModelID
mut[["ModelID", "dna_seq"]].to_csv(
    "data/processed/mutation_sequences.csv",
    index=False
)

print("Saved mutation_sequences.csv")

