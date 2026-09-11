class SectorsConfigError(Exception):
    """Raised before any network call, so the attempt cannot have cost credits.

    Distinguishing this from a mid-flight failure keeps the audit credit figures
    honest: a missing API key spends nothing, while a request that reached
    Sectors is billed conservatively even if it errored.
    """
