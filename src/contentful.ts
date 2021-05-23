export const thumb =
  (size: number) =>
  ({ url: string }: { url: string }): string =>
    `${{ url: string }.url}?fm=webp&fit=thumb&w=${
      size * (window.devicePixelRatio ?? 1)
    }&h=${size * (window.devicePixelRatio ?? 1)}&q=75`;

export const sized =
  ({ width, height }: { width: number; height: number }) =>
  ({ url: string }: { url: string }) =>
    `${{ url: string }.url}?fm=webp&w=${
      width * (window.devicePixelRatio ?? 1)
    }&h=${height * (window.devicePixelRatio ?? 1)}&q=95`;
