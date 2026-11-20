import {
  pageGraph,
  serializeStructuredData,
  type PageSchemaInput,
} from "@/lib/structured-data";

export function StructuredData({ value }: { value: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(value) }}
    />
  );
}

export default function PageSchema(props: PageSchemaInput) {
  const graph = pageGraph(props);
  return graph ? <StructuredData value={graph} /> : null;
}
