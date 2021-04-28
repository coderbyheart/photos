export const thumb = (size: number) => ({
  url: string,
}: {
  url: string;
}): string =>
  `${{ url: string }.url}?fm=webp&fit=thumb&w=${size}&h=${size}&q=75`;

export const header = ({ url: string }: { url: string }): string =>
  `${{ url: string }.url}?fm=webp&fit=thumb&w=1024&h=250&q=75`;

export const fullsize = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => ({ url: string }: { url: string }) =>
  `${{ url: string }.url}?fm=webp&w=${width}&h=${height}&q=75`;
