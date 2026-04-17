import { useQuery } from "@tanstack/react-query";
import { pageContentRepo, type PageContentBlock } from "../api/pageContent.repo";

const DEFAULT_LOCALE = "it";

export const usePageBlocks = (slug: string, locale: string = DEFAULT_LOCALE) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["page-blocks", slug, locale],
    queryFn: () => pageContentRepo.listBySlug(slug, locale),
    enabled: !!slug,
  });

  const blockMap = new Map<string, PageContentBlock>();
  if (data) {
    for (const block of data) {
      blockMap.set(block.block_key, block);
    }
  }

  const getBlock = (key: string): PageContentBlock | null => {
    return blockMap.get(key) ?? null;
  };

  return { blocks: data ?? [], blockMap, getBlock, isLoading, isError };
};
