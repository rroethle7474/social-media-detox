export interface QuoteDto {
  quoteText: string;
  quoteDateFetched: string;
  quoteImage: number[]; // This represents a byte array from C#
}
